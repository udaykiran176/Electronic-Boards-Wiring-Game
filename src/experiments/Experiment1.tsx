import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../FullscreenContext';
import powerSupplyBoard from '../assets/power supply board.svg';
import ledboard from '../assets/led board.svg';
import battery from '../assets/9vbattery.svg';
import { useEffect, useState, useCallback } from 'react';
import { motion, useAnimation } from "framer-motion";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import '../index.css';

// Add these types at the top of the file
type CircuitNodeType = '5V' | 'GND' | 'LED_POSITIVE' | 'LED_NEGATIVE';

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

export default function Experiment1() {
  const navigate = useNavigate();
  const { setIsFullscreen } = useFullscreen();
  const [batteryX, setBatteryX] = useState(700);
  const [isWireConnected, setIsWireConnected] = useState(false);
  const [isGndWireConnected, setIsGndWireConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CircuitNode | null>(null);
  const [wireDirection, setWireDirection] = useState<'left' | 'right'>('left');
  const [gndWireDirection, setGndWireDirection] = useState<'left' | 'right'>('left');
  const [showSimulationButton, setShowSimulationButton] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isLedOn, setIsLedOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpHighlight, setShowHelpHighlight] = useState(true);
  const wireControls = useAnimation();
  const gndWireControls = useAnimation();
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tempWirePath, setTempWirePath] = useState<{positive: boolean, path: string} | null>(null);

  // Define circuit nodes
  const circuitNodes: CircuitNode[] = [
    { id: '5v', type: '5V', x: 590, y: 289 },
    { id: 'gnd', type: 'GND', x: 591, y: 309 },
    { id: 'led_pos', type: 'LED_POSITIVE', x: 275, y: 200 },
    { id: 'led_neg', type: 'LED_NEGATIVE', x: 305, y: 200 },
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
    navigate('/');
  };

  const handleBatteryClick = () => {
    if (isSimulationMode) return;
    setBatteryX(prev => prev === 700 ? 620 : 700);
    toast.success('Battery moved! 🔋', {
      duration: 1000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '12px',
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
    return (
      (node1.type === '5V' && node2.type === 'LED_POSITIVE') ||
      (node1.type === 'LED_POSITIVE' && node2.type === '5V') ||
      (node1.type === 'GND' && node2.type === 'LED_NEGATIVE') ||
      (node1.type === 'LED_NEGATIVE' && node2.type === 'GND')
    );
  };

  const handleNodeClick = (node: CircuitNode) => {
    if (isSimulationMode) return;

    if (!selectedNode) {
      setSelectedNode(node);
      // Show temporary wire path when terminal is selected
      if (node.type === '5V' || node.type === 'LED_POSITIVE') {
        setWireDirection(node.type === '5V' ? 'right' : 'left');
        const path = node.type === '5V' 
          ? "M 591 299 L 591 270 L 400 270 L 285 270 L 285 210"  // From 5V to LED+
          : "M 285 210 L 285 270 L 400 270 L 591 270 L 591 299"; // From LED+ to 5V
        setTempWirePath({ positive: true, path });
        wireControls.set({ pathLength: 1 });
      } else {
        setGndWireDirection(node.type === 'GND' ? 'right' : 'left');
        const path = node.type === 'GND'
          ? "M 591 319 L 591 360 L 315 360 L 315 210"  // From GND to LED-
          : "M 315 210 L 315 360 L 591 360 L 591 319"; // From LED- to GND
        setTempWirePath({ positive: false, path });
        gndWireControls.set({ pathLength: 1 });
      }
      toast.success(`Selected ${node.type} terminal! Now click the matching terminal!`, {
        duration: 1000,
        style: {
          background: '#4CAF50',
          color: 'white',
          fontSize: '12px',
          padding: '5px 10px',
        }
      });
      return;
    }

    // If clicking the same node, deselect it
    if (selectedNode.id === node.id) {
      setSelectedNode(null);
      setTempWirePath(null);
      setConnections(prev => prev.filter(conn => 
        conn.from.id !== node.id && conn.to.id !== node.id
      ));
      if (node.type === '5V' || node.type === 'LED_POSITIVE') {
        setIsWireConnected(false);
        wireControls.set({ pathLength: 0 });
      } else {
        setIsGndWireConnected(false);
        gndWireControls.set({ pathLength: 0 });
      }
      return;
    }

    // Try to make a connection
    if (canConnect(selectedNode, node)) {
      const newConnection: Connection = {
        from: selectedNode,
        to: node,
      };
      setConnections(prev => [...prev, newConnection]);
      setTempWirePath(null);
      
      if (selectedNode.type === '5V' || node.type === '5V') {
        setIsWireConnected(true);
        wireControls.start({
          pathLength: 1,
          transition: { duration: 0.8, ease: "easeInOut" }
        });
      } else {
        setIsGndWireConnected(true);
        gndWireControls.start({
          pathLength: 1,
          transition: { duration: 0.8, ease: "easeInOut" }
        });
      }
      
      toast.success('Connection made! ✨', {
        duration: 1000,
        style: {
          background: '#4CAF50',
          color: 'white',
          fontSize: '12px',
          padding: '5px 10px',
        }
      });
    } else {
      setTempWirePath(null);
      setSelectedNode(null);
      toast.error('Invalid connection! Try matching terminals.', {
        duration: 1000,
        style: {
          background: '#f44336',
          color: 'white',
          fontSize: '12px',
          padding: '5px 10px',
        }
      });
    }
    setSelectedNode(null);
  };

  // Update the circuit completion check
  useEffect(() => {
    const hasPositiveConnection = connections.some(conn => 
      (conn.from.type === '5V' && conn.to.type === 'LED_POSITIVE') ||
      (conn.from.type === 'LED_POSITIVE' && conn.to.type === '5V')
    );
    
    const hasNegativeConnection = connections.some(conn => 
      (conn.from.type === 'GND' && conn.to.type === 'LED_NEGATIVE') ||
      (conn.from.type === 'LED_NEGATIVE' && conn.to.type === 'GND')
    );

    if (hasPositiveConnection && hasNegativeConnection && batteryX === 620 && !showSimulationButton) {
      // Add a 2-second delay before showing success message
      setTimeout(() => {
        // Show single success message
        toast.success('Circuit complete! Ready for simulation! ✨', {
          duration: 1000,
          style: {
            background: '#4CAF50',
            color: 'white',
            fontSize: '12px',
            padding: '5px 10px',
          },
          icon: '✨',
        });
        
        // Trigger confetti and show simulation button
        triggerConfetti();
        setShowSimulationButton(true);
      }, 1000);
    }
  }, [connections, batteryX, showSimulationButton, triggerConfetti]);

  const handleSimulationMode = () => {
    setIsSimulationMode(true);
    setIsLedOn(true);
  };

  const handleLedToggle = () => {
    setIsLedOn(!isLedOn);
    toast.success(`Light is ${!isLedOn ? 'on' : 'off'}`, {
      duration: 1000,
            style: {
              background: '#4CAF50',
              color: 'white',
        fontSize: '12px',
        padding: '5px 10px',
      },
      icon: isLedOn ? '💡' : '🔌',
    });
  };

  const handleExitSimulation = () => {
    setIsSimulationMode(false);
    setIsLedOn(false);
    handleReset();
  };

  // Update the reset function
  const handleReset = () => {
    setConnections([]);
    setSelectedNode(null);
    setTempWirePath(null);
    setIsWireConnected(false);
    setIsGndWireConnected(false);
    setWireDirection('left');
    setGndWireDirection('left');
    setShowSimulationButton(false);
    setIsSimulationMode(false);
    setBatteryX(700);
    wireControls.set({ pathLength: 0 });
    gndWireControls.set({ pathLength: 0 });

    toast.success('All connections reset! 🔄', {
      duration: 1000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '12px',
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
          duration: 1000,
          style: {
            background: '#4CAF50',
            color: 'white',
            fontSize: '12px',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        }}
      />
      {/* Title Section - 10vh */}
      <div className="bg-blue-200 h-[10vh] flex items-center -full border-b border-blue-200 p-5 rounded-md">
        <p className='text-center text-black-800 text-lg font-semibold'>
          {isSimulationMode ? 'Simulation Mode - click the button to turn the LED on and off' : 'Connect the wires! Match 5V to LED + and GND to LED - to light up the LED! ✨'}
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

        {/* Power Supply board wit Terminals */}
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
      {/* LED Board Terminals */}
      <g transform="rotate(0, 500, 500)">
          <image 
            href={ledboard} 
            x="320" 
            y="500"
            width="200" 
            height="200" 
            preserveAspectRatio="xMidYMid meet"
            transform="rotate(90, 600, 300)"
          />
            {/* Positive (+) Terminal */}
            <rect
              x="275"
              y="200"
              width="20"
              height="20"
              fill={selectedNode?.id === 'led_pos' ? '#ff6666' : '#FF0000'}
              stroke={selectedNode?.id === 'led_pos' ? '#cc0000' : '#000'}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
              onClick={() => handleNodeClick(circuitNodes[2])}
            />
           
            {/* Negative (-) Terminal */}
            <rect
              x="305"
              y="200"
              width="20"
              height="20"
              fill={selectedNode?.id === 'led_neg' ? '#666666' : '#000000'}
              stroke={selectedNode?.id === 'led_neg' ? '#333333' : '#000'}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
              onClick={() => handleNodeClick(circuitNodes[3])}
            />
           
          </g>

          {/* Positive Wire Connection with Animation */}
        {(isWireConnected && connections.some(conn => 
          (conn.from.id === '5v' && conn.to.id === 'led_pos') ||
          (conn.from.id === 'led_pos' && conn.to.id === '5v')
        ) || (tempWirePath?.positive)) && (
            <motion.path
            d={tempWirePath?.positive ? tempWirePath.path : (
              wireDirection === 'left' 
                ? "M 285 210 L 285 270 L 400 270 L 590 270 L 590 299"  // LED+ to 5V
                : "M 590 299 L 590 270 L 400 270 L 285 270 L 285 210"  // 5V to LED+
            )}
              stroke="#FF0000"
              strokeWidth="4"
              fill="none"
              strokeDasharray="1,1"
              initial={{ pathLength: 0 }}
              animate={wireControls}
              style={{
              pathLength: tempWirePath?.positive ? 1 : 0,
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }}
            />
          )}

          {/* Negative Wire Connection with Animation */}
        {(isGndWireConnected && connections.some(conn => 
          (conn.from.id === 'gnd' && conn.to.id === 'led_neg') ||
          (conn.from.id === 'led_neg' && conn.to.id === 'gnd')
        ) || (tempWirePath && !tempWirePath.positive)) && (
            <motion.path
            d={tempWirePath?.positive === false ? tempWirePath.path : (
              gndWireDirection === 'left'
                ? "M 315 210 L 315 360 L 591 360 L 591 319"  // LED- to GND
                : "M 591 319 L 591 360 L 315 360 L 315 210"  // GND to LED-
            )}
              stroke="#000000"
              strokeWidth="4"
              fill="none"
              strokeDasharray="1,1"
              initial={{ pathLength: 0 }}
              animate={gndWireControls}
              style={{
              pathLength: tempWirePath?.positive === false ? 1 : 0,
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }}
            />
          )}

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

        {/* LED Board with Glowing Effect */}
        <g transform="rotate(0, 500, 500)">
          <image 
            href={ledboard} 
            x="320" 
            y="500"
            width="200" 
            height="200" 
            preserveAspectRatio="xMidYMid meet"
            transform="rotate(90, 600, 300)"
          />
          {/* Positive (+) Terminal */}
          <rect
            x="275"
            y="200"
            width="20"
            height="20"
            fill={selectedNode?.id === 'led_pos' ? '#ff6666' : '#FF0000'}
            stroke={selectedNode?.id === 'led_pos' ? '#cc0000' : '#000'}
            strokeWidth="2"
            rx="3"
            style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
            onClick={() => handleNodeClick(circuitNodes[2])}
          />
         
          {/* Negative (-) Terminal */}
          <rect
            x="305"
            y="200"
            width="20"
            height="20"
            fill={selectedNode?.id === 'led_neg' ? '#666666' : '#000000'}
            stroke={selectedNode?.id === 'led_neg' ? '#333333' : '#000'}
            strokeWidth="2"
            rx="3"
            style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
            onClick={() => handleNodeClick(circuitNodes[3])}
          />

          {/* Glowing LED Circle */}
          {isSimulationMode && (
            <>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <radialGradient id="ledGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#0cdbf8', stopOpacity: 1 }} />
                </radialGradient>
              </defs>
              <circle
                cx="300"
                cy="50"
                r={isLedOn ? '50' : '5'}
                fill={isLedOn ? 'url(#ledGradient)' : '#0cdbf8'}
                filter="url(#glow)"
                opacity="0.9"
              />
            </>
          )}
        </g>

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
              y="20"
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
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <div className="relative">
          {showHelpHighlight && (
            <div className="absolute -inset-4 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-30"></div>
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
      </div>
          )}
          <button
            onClick={() => {
              setShowHelp(true);
              setShowHelpHighlight(false);
            }}
            className="relative px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-green-500 font-semibold border-2 border-green-500 text-white
              hover:bg-green-400 active:bg-green-600 transition-colors
              flex items-center gap-1 rounded-md shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Help
          </button>
        </div>
        <button
          onClick={handleBack}
          className="px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-blue-500 font-semibold border-2 border-blue-500 text-white
            hover:bg-blue-400 active:bg-blue-600 transition-colors
            flex items-center rounded-md shadow-lg"
        >
          Go Back to Experiments
        </button>
        <button
          onClick={handleReset}
          className="px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-red-500 font-semibold border-2 border-red-500 text-white
            hover:bg-red-400 active:bg-red-600 transition-colors
            flex items-center gap-1 rounded-md shadow-lg"
        >
          Reset Connections
        </button>
        {isSimulationMode && (
          <button
            onClick={handleExitSimulation}
            className="px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-red-500 font-semibold border-2 border-red-500 text-white
              hover:bg-red-400 active:bg-red-600 transition-colors
              flex items-center gap-1 rounded-md shadow-lg"
          >
            Exit Simulation
          </button>
        )}
      </div>

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
                <p>Click on the red terminal (5V) to start connecting the positive wire! ⚡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">3.</span>
                <p>Click on the red terminal (+) of the LED to complete the positive connection! 💡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">4.</span>
                <p>Click on the black terminal (GND) to start connecting the ground wire! ⚡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">5.</span>
                <p>Click on the black terminal (-) of the LED to complete the ground connection! 💡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">6.</span>
                <p>Once all connections are made, you can enter simulation mode and control the LED! 🎮</p>
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold text-sm sm:text-base">💡 Tips:</p>
                <ul className="list-disc list-inside mt-2 text-blue-700 text-sm sm:text-base space-y-1">
                  <li>Make sure to connect matching colors (red to red, black to black)</li>
                  <li>You can click a terminal again to remove its connection</li>
                  <li>Use the Reset button if you want to start over</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Yay! You did it! 🎉
            </div>
            <button 
              onClick={handleSimulationMode}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800 font-bold text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play mr-2 h-5 w-5">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
              </svg>
              Go to Simulation 🚀
            </button>
          </div>
       </div>
      )}
    </div>

   

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