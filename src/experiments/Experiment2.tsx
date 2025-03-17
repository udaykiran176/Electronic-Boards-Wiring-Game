import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../FullscreenContext';
import { useSound } from '../SoundContext';
import powerSupplyBoard from '../assets/power supply board.svg';
import { FaArrowLeft, FaUndo, FaPlay, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import ledboard from '../assets/led board.svg';
import battery from '../assets/9vbattery.svg';
import { useEffect, useState, useCallback } from 'react';
import { motion, useAnimation } from "framer-motion";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { MdExitToApp } from 'react-icons/md';



// Add these types at the top of the file
type CircuitNodeType = '5V' | 'GND' | 'LED1_POSITIVE' | 'LED1_NEGATIVE' | 'LED2_POSITIVE' | 'LED2_NEGATIVE' | 'LED3_POSITIVE' | 'LED3_NEGATIVE';

interface CircuitNode {
  id: string;
  type: CircuitNodeType;
  x: number;
  y: number;
}

interface Connection {
  from: CircuitNode;
  to: CircuitNode;
}

export default function Experiment2() {
  const navigate = useNavigate();
  const { setIsFullscreen } = useFullscreen();
  const { playSound } = useSound();
  const [batteryX, setBatteryX] = useState(700);
  const [selectedNode, setSelectedNode] = useState<CircuitNode | null>(null);
  const [showSimulationButton, setShowSimulationButton] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isLedOn, setIsLedOn] = useState(true);
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tempWirePath, setTempWirePath] = useState<{path: string} | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpHighlight, setShowHelpHighlight] = useState(true);
  const wireControls = useAnimation();

    // Navigation handlers
    const handleNextExperiment = () => {
      setIsFullscreen(true);
      navigate('/experiment/3');
      playSound('click');
    };

    const handlePreviousExperiment = () => {
      setIsFullscreen(true);
      navigate('/experiment/1');
      playSound('click');
    };

  // Define circuit nodes for three LEDs in series
  const circuitNodes: CircuitNode[] = [
    { id: '5v', type: '5V', x: 583, y: 289 },
    { id: 'gnd', type: 'GND', x: 583, y: 309 },
    { id: 'led1_pos', type: 'LED1_POSITIVE', x: 95, y: 200 },
    { id: 'led1_neg', type: 'LED1_NEGATIVE', x: 125, y: 200 },
    { id: 'led2_pos', type: 'LED2_POSITIVE', x: 245, y: 200 },
    { id: 'led2_neg', type: 'LED2_NEGATIVE', x: 275, y: 200 },
    { id: 'led3_pos', type: 'LED3_POSITIVE', x: 395, y: 200 },
    { id: 'led3_neg', type: 'LED3_NEGATIVE', x: 425, y: 200 },
  ];

  // Enhanced fullscreen handling
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
            await (screen.orientation as any).lock('landscape');
          }
        }
        setIsFullscreenState(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    };

    // Initial fullscreen entry
    enterFullscreen();

    // Handle visibility changes
    const handleVisibilityChange = async () => {
      if (!document.hidden && !document.fullscreenElement) {
        await enterFullscreen();
      }
    };

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreenState(!!document.fullscreenElement);
    };

    // Handle screen wake lock
    const handleWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error('Error requesting wake lock:', err);
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Request wake lock
    handleWakeLock();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  const handleBack = () => {
    setIsFullscreen(true);
    navigate('/game');
  };

  const handleBatteryClick = () => {
    if (isSimulationMode) return;
    setBatteryX(prev => prev === 700 ? 620 : 700);
    playSound('click');
    toast.success('Battery moved! 🔋', {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      }
    });
  };

  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const canConnect = (node1: CircuitNode, node2: CircuitNode) => {
    // Valid connections for series circuit
    const validConnections = [
      ['5V', 'LED1_POSITIVE'],
      ['LED1_NEGATIVE', 'LED2_POSITIVE'],
      ['LED2_NEGATIVE', 'LED3_POSITIVE'],
      ['LED3_NEGATIVE', 'GND']
    ];

    return validConnections.some(([start, end]) => 
      (node1.type === start && node2.type === end) || 
      (node1.type === end && node2.type === start)
    );
  };

  const getWirePath = (from: CircuitNode, to: CircuitNode) => {
    // Define the connection type
    const connectionType = `${from.type}_${to.type}`;
    const reverseConnectionType = `${to.type}_${from.type}`;

    // Predefined paths for each connection
    const wirePaths: { [key: string]: string } = {
      '5V_LED1_POSITIVE': 'M 590 289 L 590 270 L 400 270 L 105 270 L 105 210',
      'LED1_POSITIVE_5V': 'M 105 210 L 105 270 L 400 270 L 590 270 L 590 289',
      
      'LED1_NEGATIVE_LED2_POSITIVE': 'M 135 210 L 135 240 L 255 240 L 255 210',
      'LED2_POSITIVE_LED1_NEGATIVE': 'M 255 210 L 255 240 L 135 240 L 135 210',
      
      'LED2_NEGATIVE_LED3_POSITIVE': 'M 285 210 L 285 240 L 405 240 L 405 210',
      'LED3_POSITIVE_LED2_NEGATIVE': 'M 405 210 L 405 240 L 285 240 L 285 210',
      
      'LED3_NEGATIVE_GND': 'M 435 200 L 435 360 L 593 360 L 593 309',
      'GND_LED3_NEGATIVE': 'M 593 309 L 593 360 L 435 360 L 435 200',
    };

    // Return the predefined path if it exists
    return wirePaths[connectionType] || wirePaths[reverseConnectionType] || '';
  };

  const getWireColor = (from: CircuitNode, to: CircuitNode) => {
    // LED3 to GND connections are black
    if ((from.type === 'LED3_NEGATIVE' && to.type === 'GND') ||
        (from.type === 'GND' && to.type === 'LED3_NEGATIVE')) {
      return '#000000';
    }
    // LED to LED connections are blue
    if (from.type.includes('LED') && to.type.includes('LED')) {
      return '#0000FF';
    }
    // Power connections remain red
    return '#FF0000';
  };

  const handleNodeClick = (node: CircuitNode) => {
    if (isSimulationMode) return;

    if (!selectedNode) {
      setSelectedNode(node);
      playSound('click');
      toast.success(`Selected ${node.type} terminal! Now click a matching terminal!`, {
        duration: 2000,
        style: {
          background: '#4CAF50',
          color: 'white',
          fontSize: '14px',
          padding: '5px 10px',
        }
      });
      return;
    }

    // If clicking the same node, deselect it
    if (selectedNode.id === node.id) {
      setSelectedNode(null);
      playSound('click');
      setConnections(prev => prev.filter(conn => 
        conn.from.id !== node.id && conn.to.id !== node.id
      ));
      return;
    }

    // Try to make a connection
    if (canConnect(selectedNode, node)) {
      const newConnection: Connection = {
        from: selectedNode,
        to: node,
      };
      setConnections(prev => [...prev, newConnection]);
      playSound('connection');
      
      wireControls.start({
        pathLength: 1,
        transition: { duration: 0.8, ease: "easeInOut" }
      });
      
      toast.success('Connection made! ✨', {
        duration: 2000,
        style: {
          background: '#4CAF50',
          color: 'white',
          fontSize: '14px',
          padding: '5px 10px',
        }
      });
    } else {
      playSound('error');
      toast.error('Invalid connection! Try connecting in series.', {
        duration: 2000,
        style: {
          background: '#f44336',
          color: 'white',
          fontSize: '14px',
          padding: '5px 10px',
        }
      });
    }
    setSelectedNode(null);
  };

  // Check if circuit is complete
  useEffect(() => {
    const requiredConnections = [
      ['5V', 'LED1_POSITIVE'],
      ['LED1_NEGATIVE', 'LED2_POSITIVE'],
      ['LED2_NEGATIVE', 'LED3_POSITIVE'],
      ['LED3_NEGATIVE', 'GND']
    ];

    const hasAllConnections = requiredConnections.every(([start, end]) =>
      connections.some(conn =>
        (conn.from.type === start && conn.to.type === end) ||
        (conn.from.type === end && conn.to.type === start)
      )
    );

    if (hasAllConnections && batteryX === 620 && !showSimulationButton) {
      setTimeout(() => {
        playSound('success');
        toast.success('Circuit complete! Ready for simulation! ✨', {
          duration: 2000,
          style: {
            background: '#4CAF50',
            color: 'white',
            fontSize: '14px',
            padding: '5px 10px',
          },
          icon: '✨',
        });
        
        triggerConfetti();
        setShowSimulationButton(true);
      }, 500);
    }
  }, [connections, batteryX, showSimulationButton, triggerConfetti, playSound]);

  const handleSimulationMode = () => {
    setIsSimulationMode(true);
    setIsLedOn(true);
    playSound('success');
  };

  const handleLedToggle = () => {
    setIsLedOn(!isLedOn);
    playSound('click');
    toast.success(`All LEDs are ${!isLedOn ? 'on' : 'off'}`, {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      }
    });
  };

  const handleExitSimulation = () => {
    setIsSimulationMode(false);
    setIsLedOn(false);
    handleReset();
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedNode(null);
    setTempWirePath(null);
    setShowSimulationButton(false);
    setIsSimulationMode(false);
    setIsLedOn(false);
    setBatteryX(700);
    playSound('click');
    wireControls.set({ pathLength: 0 });

    toast.success('All connections reset! 🔄', {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      }
    });
  };

  const handleEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (err) {
            console.warn('Orientation lock not supported or failed:', err);
          }
        } else {
          console.warn('Orientation lock API not supported on this device.');
        }
      }
      setIsFullscreenState(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  };

  return (
    <div style={{ userSelect: 'none' }} className="min-h-screen min-w-screen bg-white flex flex-col overflow-hidden fixed inset-0 p-2">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#4CAF50',
            color: 'white',
            fontSize: '18px',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        }}
      />
      {/* Title Section */}
      <div className="bg-blue-200 h-[10vh] flex items-center -full border-b border-blue-200 p-5 rounded-md">
        <p className='text-center text-black-800 text-lg font-semibold'>
          {isSimulationMode 
            ? 'Simulation Mode - Control all LEDs in series!' 
            : 'Connect the LEDs in series! Start from 5V → LED1 → LED2 → LED3 → GND ✨'}
        </p>
      </div>

      <div className='items-center justify-center w-full h-[90vh] bg-gray-50 relative'>
        <svg 
          className={`w-full h-full transition-all duration-300 ${showSimulationButton && !isSimulationMode ? 'blur-md' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid Background Pattern */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          
          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" /> 
          {/* Power Supply Board */}
          <g transform="rotate(0, 500, 500)">
          <image 
            href={powerSupplyBoard} 
              x="650" 
              y="500"
            width="200" 
            height="200" 
            preserveAspectRatio="xMidYMid meet"
            transform="rotate(-90, 500, 500)"
          />  
          
            {/* 5V Terminal */}
            <rect
              x="583"
              y="289"
              width="20"
              height="20"
              fill={selectedNode?.id === '5v' ? '#ff6666' : '#FF0000'}
              stroke={selectedNode?.id === '5v' ? '#cc0000' : '#000'}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
              onClick={() => handleNodeClick(circuitNodes[0])}
            />

            {/* GND Terminal */}
            <rect
              x="583"
              y="309"
              width="20"
              height="20"
              fill={selectedNode?.id === 'gnd' ? '#666666' : '#000000'}
              stroke={selectedNode?.id === 'gnd' ? '#333333' : '#000'}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
              onClick={() => handleNodeClick(circuitNodes[1])}
            />
          </g>

          {/* LED Boards */}
          {[1, 2, 3].map((ledNum, index) => (
            <g key={ledNum}>
          <image 
            href={ledboard} 
                x={-20 + (index * 150)} 
                y="150"
            width="200" 
            height="200" 
            preserveAspectRatio="xMidYMid meet"
                transform={`rotate(90, ${170 + (index * 150)}, 200)`}
              />
              
              {/* Positive Terminal */}
              <rect
                x={95 + (index * 150)}
                y={200}
                width="20"
                height="20"
                fill={selectedNode?.id === `led${ledNum}_pos` ? '#ff6666' : '#FF0000'}
                stroke={selectedNode?.id === `led${ledNum}_pos` ? '#cc0000' : '#000'}
                strokeWidth="2"
                rx="3"
                style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
                onClick={() => handleNodeClick(circuitNodes[2 + (index * 2)])}
              />

              {/* Negative Terminal */}
              <rect
                x={125 + (index * 150)}
                y={200}
                width="20"
                height="20"
                fill={selectedNode?.id === `led${ledNum}_neg` ? '#666666' : '#000000'}
                stroke={selectedNode?.id === `led${ledNum}_neg` ? '#333333' : '#000'}
                strokeWidth="2"
                rx="3"
                style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
                onClick={() => handleNodeClick(circuitNodes[3 + (index * 2)])}
              />

              {/* LED Glow Effect */}
              {isSimulationMode && (
                <>
                  <defs>
                    <filter id={`glow${ledNum}`}>
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <radialGradient id={`ledGradient${ledNum}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#0cdbf8', stopOpacity: 1 }} />
                    </radialGradient>
                  </defs>
                  <circle
                    cx={120 + (index * 150)}
                    cy={38}
                    r={isLedOn ? '35' : '5'}
                    fill={isLedOn ? `url(#ledGradient${ledNum})` : '#0cdbf8'}
                    filter={`url(#glow${ledNum})`}
                    opacity="0.9"
                  />
                </>
              )}

              {/* LED Label - Moved to front */}
              <g transform={`translate(${70 + (index * 150)}, 80)`}>
                <text
                  x="50"
                  y="20"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="Arial"
                >
                  LED {ledNum}
                </text>
              </g>
            </g>
          ))}

          {/* Wire Connections */}
          {connections.map((conn) => (
            <motion.path
              key={`${conn.from.id}-${conn.to.id}`}
              d={getWirePath(conn.from, conn.to)}
              stroke={getWireColor(conn.from, conn.to)}
              strokeWidth="4"
              fill="none"
              strokeDasharray="1,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          ))}

          {/* Temporary Wire Path */}
          {tempWirePath && selectedNode && (
            <motion.path
              d={tempWirePath.path}
              stroke={selectedNode.type.includes('LED') ? '#0000FF' : '#FF0000'}
              strokeWidth="4"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}

          {/* Battery */}
          <motion.image
            href={battery}
            initial={{ x: 700 }}
            animate={{ x: batteryX }}
            y="170"
            width="300"
            height="300"
            preserveAspectRatio="xMidYMid meet"
            onClick={handleBatteryClick}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
          />

          {/* On/Off Button */}
          {isSimulationMode && (
            <g transform="translate(650, 230)">
              <rect
                x="0"
                y="0"
                width="40"
                height="40"
                fill={isLedOn ? '#f44336' : '#4CAF50'}
                stroke="#000"
                strokeWidth="1"
                rx="10"
                style={{ cursor: 'pointer' }}
                onClick={handleLedToggle}
              />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {isLedOn ? 'OFF' : 'ON'}
              </text>
            </g>
          )}
        </svg>


    {/* Controls Section - Positioned over SVG */}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between z-10">
      {/* Left side controls group */}
      <div className="flex gap-1.5">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-blue-500 font-medium border border-blue-500 text-white
            hover:bg-blue-400 active:bg-blue-600 transition-colors
            flex items-center gap-1.5 rounded-md shadow-md"
          title="Go Back"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Back</span>
        </button>

        {/* Help Button */}
        <div className="relative">
          {showHelpHighlight && (
            <div className="absolute -inset-2 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-30"></div>
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
            </div>
          )}
          <button
            onClick={() => {
              setShowHelp(true);
              setShowHelpHighlight(false);
            }}
            className="relative px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-green-500 font-medium border border-green-500 text-white
              hover:bg-green-400 active:bg-green-600 transition-colors
              flex items-center gap-1.5 rounded-md shadow-md"
            title="Help Guide"
          >
            <FaQuestionCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Help</span>
          </button>
        </div>

        {/* Only show reset button when there are changes AND not in simulation mode */}
        {!isSimulationMode && (connections.length > 0 || batteryX !== 700) && (
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-red-500 font-medium border border-red-500 text-white
              hover:bg-red-400 active:bg-red-600 transition-colors
              flex items-center gap-1.5 rounded-md shadow-md animate-fadeIn"
            title="Reset Circuit"
          >
            <FaUndo className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Reset</span>
          </button>
        )}

        {isSimulationMode && (
          <button
            onClick={handleExitSimulation}
            className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-red-500 font-medium border border-red-500 text-white
              hover:bg-red-400 active:bg-red-600 transition-colors
              flex items-center gap-1.5 rounded-md shadow-md"
            title="Exit Simulation"
          >
            <MdExitToApp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Exit</span>
          </button>
        )}

        {showSimulationButton && !isSimulationMode && (
          <button
            onClick={handleSimulationMode}
            className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-purple-100 font-medium border border-purple-300 text-purple-800
              hover:bg-purple-200 active:bg-purple-400 transition-colors
              flex items-center gap-1.5 rounded-md shadow-md"
            title="Start Simulation"
          >
            <FaPlay className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Simulate</span>
          </button>
        )}
      </div>

      {/*Right  side*/}
      <div className='flex gap-1.5'>
      {/* Previous Experiment Button */}
      <button
        onClick={handlePreviousExperiment}
        className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-yellow-200 font-medium border border-yellow-500 text-yellow-800
          hover:bg-yellow-200 active:bg-yellow-400 transition-colors
          flex items-center gap-1.5 rounded-md shadow-md"
        title="Previous Experiment"
      >
        <FaArrowLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline text-xs">Previous</span>
      </button>
        {/* Next Experiment Button */}
      <button
        onClick={handleNextExperiment}
        className="px-2 py-1 text-xs sm:text-xs sm:px-2.5 sm:py-1.5 bg-purple-100 font-medium border border-purple-300 text-purple-800
          hover:bg-purple-200 active:bg-purple-400 transition-colors
          flex items-center gap-1.5 rounded-md shadow-md"
        title="Next Experiment"
      >
        <span className="hidden sm:inline text-xs">Next</span>
        <FaArrowRight className="h-3.5 w-3.5" />
      </button>

      </div>
   
    </div>

        {/* Success Overlay */}
        {showSimulationButton && !isSimulationMode && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-20'>
            <div className="relative flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div style={{ transform: 'scale(1.0878) rotate(-23.8561deg)', filter: 'brightness(1.21949)', animation: 'spin 3s linear infinite' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div style={{ transform: 'scale(1.16019) rotate(-45.1312deg)', filter: 'brightness(1.40047)', animation: 'spin 3s linear infinite reverse' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div style={{ transform: 'scale(1.19343) rotate(-70.947deg)', filter: 'brightness(1.48358)', animation: 'spin 3s linear infinite' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                Amazing! Series Circuit Complete! 🎉
              </div>
              <button 
                onClick={handleSimulationMode}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800 font-bold text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play mr-2 h-5 w-5">
                  <polygon points="6 3 20 12 6 21 6 3"></polygon>
                </svg>
                Start Simulation 🚀
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Prompt */}
      {!isFullscreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <button
            onClick={handleEnterFullscreen}
            className="px-6 py-3 bg-blue-500 font-semibold text-white text-lg rounded-md shadow-lg hover:bg-blue-400 active:bg-blue-600 transition-colors"
          >
            Click to Enter Fullscreen
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-[95%] sm:max-w-md w-full shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">How to Play! 🎮</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">1.</span>
                <p>Click on the battery to move it closer to the circuit! 🔋</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">2.</span>
                <p>Click on the red terminal (5V) to start connecting to LED1's positive terminal! ⚡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">3.</span>
                <p>Connect LED1's negative terminal to LED2's positive terminal! 💡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">4.</span>
                <p>Connect LED2's negative terminal to LED3's positive terminal! 💡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">5.</span>
                <p>Finally, connect LED3's negative terminal to GND to complete the series circuit! ⚡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">6.</span>
                <p>Once all connections are made, you can enter simulation mode and control all LEDs! 🎮</p>
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold text-sm sm:text-base">💡 Tips:</p>
                <ul className="list-disc list-inside mt-2 text-blue-700 text-sm sm:text-base space-y-1">
                  <li>In a series circuit, LEDs must be connected one after another</li>
                  <li>The current flows from 5V through all LEDs to GND</li>
                  <li>Blue wires connect between LEDs</li>
                  <li>You can click a terminal again to remove its connection</li>
                  <li>Use the Reset button if you want to start over</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add keyframes for spin animation
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
} 