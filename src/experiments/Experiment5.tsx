import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '../FullscreenContext';
import { useSound } from '../SoundContext';
import powerSupplyBoard from '../assets/power supply board.svg';
import ledboard from '../assets/led board.svg';
import battery from '../assets/9vbattery.svg';
import switchboard from '../assets/Tactile switch.svg';
import { useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import '../index.css';
import { FaArrowLeft, FaUndo, FaPlay, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';

// Add these types at the top of the file
type CircuitNodeType = '5V' | 'GND' | 'LED_POSITIVE' | 'LED_NEGATIVE' | 'T1' | 'T2';

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
  const { playSound } = useSound();
  const [batteryX, setBatteryX] = useState(700);
  const [selectedNode, setSelectedNode] = useState<CircuitNode | null>(null);
  const [showSimulationButton, setShowSimulationButton] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpHighlight, setShowHelpHighlight] = useState(true);
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  // Navigation handlers
  const handleNextExperiment = () => {
    setIsFullscreen(true);
    navigate('/experiment/6');
    playSound('click');
  };

  const handlePreviousExperiment = () => {
    setIsFullscreen(true);
    navigate('/experiment/4');
    playSound('click');
  };

  // Define circuit nodes
  const circuitNodes: CircuitNode[] = [
    { id: '5v', type: '5V', x: 590, y: 289 },
    { id: 'gnd', type: 'GND', x: 591, y: 309 },
    { id: 't1', type: 'T1', x: 420, y: 200 },
    { id: 't2', type: 'T2', x: 445, y: 200 },
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
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, [confetti]);

  const canConnect = (node1: CircuitNode, node2: CircuitNode) => {
    // Helper functions to identify terminal types
    const isSwitchTerminal = (node: CircuitNode) => node.type === 'T1' || node.type === 'T2';
    const isPowerTerminal = (node: CircuitNode) => node.type === '5V' || node.type === 'GND';

    // If no connections exist yet, allow either 5V or GND to switch terminal
    if (connections.length === 0) {
      return (isPowerTerminal(node1) && isSwitchTerminal(node2)) || 
             (isPowerTerminal(node2) && isSwitchTerminal(node1));
    }

    // Determine which pattern we're following based on first connection
    const firstConnection = connections[0];
    const isFirstConnectionFrom5V = firstConnection.from.type === '5V' || firstConnection.to.type === '5V';
    
    if (isFirstConnectionFrom5V) {
      // Pattern 1: 5V → (T1/T2) → LED+ → LED- → GND
      if (connections.length === 1) {
        return (isSwitchTerminal(node1) && node2.type === 'LED_POSITIVE') ||
               (isSwitchTerminal(node2) && node1.type === 'LED_POSITIVE');
      }
      if (connections.length === 2) {
        return (node1.type === 'LED_NEGATIVE' && node2.type === 'GND') ||
               (node2.type === 'LED_NEGATIVE' && node1.type === 'GND');
      }
    } else {
      // Pattern 2: GND → (T1/T2) → LED- → LED+ → 5V
      if (connections.length === 1) {
        return (isSwitchTerminal(node1) && node2.type === 'LED_NEGATIVE') ||
               (isSwitchTerminal(node2) && node1.type === 'LED_NEGATIVE');
      }
      if (connections.length === 2) {
        return (node1.type === 'LED_POSITIVE' && node2.type === '5V') ||
               (node2.type === 'LED_POSITIVE' && node1.type === '5V');
      }
    }

    return false;
  };

  const getWirePath = (from: CircuitNode, to: CircuitNode) => {
    const fromX = from.x + 10; // Center of terminal (half of 20px width)
    const fromY = from.y + 10; // Center of terminal (half of 20px height)
    const toX = to.x + 10;     // Center of terminal (half of 20px width)
    const toY = to.y + 10;     // Center of terminal (half of 20px height)

    // For power supply connections (5V and GND)
    if (from.type === '5V' || from.type === 'GND' || to.type === '5V' || to.type === 'GND') {
      const powerNode = from.type === '5V' || from.type === 'GND' ? from : to;
      const otherNode = from.type === '5V' || from.type === 'GND' ? to : from;
      
      // Calculate the routing points for the bent path
      const routingY = powerNode.y + 10; // Start at power terminal's y position
      const routingX = (powerNode.x + otherNode.x) / 2; // Midpoint between terminals
      
      // Create a path with two right-angled bends
      return `M ${fromX} ${fromY} 
              L ${fromX} ${routingY} 
              L ${routingX} ${routingY} 
              L ${routingX} ${toY} 
              L ${toX} ${toY}`;
    }

    // For switch terminal connections
    if (from.type === 'T1' || from.type === 'T2' || to.type === 'T1' || to.type === 'T2') {
      const switchNode = from.type === 'T1' || from.type === 'T2' ? from : to;
      const otherNode = from.type === 'T1' || from.type === 'T2' ? to : from;
      
      // Route through appropriate height based on connection type
      const routingHeight = otherNode.y < switchNode.y ? switchNode.y - 30 : switchNode.y + 30;
      return `M ${fromX} ${fromY} L ${fromX} ${routingHeight} L ${toX} ${routingHeight} L ${toX} ${toY}`;
    }

    // For direct LED connections
    const midY = (fromY + toY) / 2;
    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
  };

  const getWireColor = (from: CircuitNode, to: CircuitNode) => {
    // If either terminal is 5V or LED_POSITIVE, use red
    if (from.type === '5V' || to.type === '5V' ||
        from.type === 'LED_POSITIVE' || to.type === 'LED_POSITIVE') {
      return '#FF0000';
    }
    // If either terminal is GND or LED_NEGATIVE, use black
    if (from.type === 'GND' || to.type === 'GND' || 
        from.type === 'LED_NEGATIVE' || to.type === 'LED_NEGATIVE') {
      return '#000000';
    }
    // For switch terminals (T1/T2), use the color based on what they're connected to
    if (from.type.includes('T') || to.type.includes('T')) {
      // Default to red for switch terminal connections
      return '#FF0000';
    }
    return '#000000'; // Default color
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
      toast.error('Invalid connection! Try combining series and parallel connections.', {
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

  // Update the circuit completion check
  useEffect(() => {
    // Helper function to check if a connection exists
    const hasConnection = (fromType: CircuitNodeType, toType: CircuitNodeType) => {
      return connections.some(conn =>
        (conn.from.type === fromType && conn.to.type === toType) ||
        (conn.from.type === toType && conn.to.type === fromType)
      );
    };

    // Check for both valid connection patterns
    const hasPattern1 = (hasConnection('5V', 'T1') || hasConnection('5V', 'T2')) &&
                       (hasConnection('T1', 'LED_POSITIVE') || hasConnection('T2', 'LED_POSITIVE')) &&
                       hasConnection('LED_NEGATIVE', 'GND');

    const hasPattern2 = (hasConnection('GND', 'T1') || hasConnection('GND', 'T2')) &&
                       (hasConnection('T1', 'LED_NEGATIVE') || hasConnection('T2', 'LED_NEGATIVE')) &&
                       hasConnection('LED_POSITIVE', '5V');

    // Check if either pattern is complete and battery is in position
    if ((hasPattern1 || hasPattern2) && batteryX === 620 && !showSimulationButton) {
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

  const handlePowerToggle = () => {
    setIsPowerOn(!isPowerOn);
    setIsSwitchOn(false);
    playSound('click');
    toast.success(`Power is ${!isPowerOn ? 'on' : 'off'}`, {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      },
      icon: isPowerOn ? '🔌' : '⚡',
    });
  };

  const handleSwitchMouseDown = () => {
    if (!isPowerOn) {
      playSound('error');
      toast.error('Turn on power first!', {
        duration: 2000,
        style: {
          background: '#f44336',
          color: 'white',
          fontSize: '14px',
          padding: '5px 10px',
        }
      });
      return;
    }
    setIsSwitchOn(true);
    playSound('click');
    toast.success('Switch pressed! LED ON ⚡', {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      },
      icon: '⚡',
    });
  };

  const handleSwitchMouseUp = () => {
    if (!isPowerOn) return;
    setIsSwitchOn(false);
    playSound('click');
    toast.success('Switch released! LED OFF ⭕', {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      },
      icon: '⭕',
    });
  };

  const handleSwitchMouseLeave = () => {
    if (!isPowerOn) return;
    setIsSwitchOn(false);
  };

  const handleSimulationMode = () => {
    setIsSimulationMode(true);
    setIsPowerOn(true);
    setIsSwitchOn(false);
    playSound('success');
    toast.success('Simulation mode started! Press and hold the switch to turn on the LED! ✨', {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      },
      icon: '✨',
    });
  };

  const handleExitSimulation = () => {
    setIsSimulationMode(false);
    setIsPowerOn(false);
    setIsSwitchOn(false);
    handleReset();
  };

  // Update the reset function
  const handleReset = () => {
    setConnections([]);
    setSelectedNode(null);
    setShowSimulationButton(false);
    setIsSimulationMode(false);
    setIsPowerOn(false);
    setIsSwitchOn(false);
    setBatteryX(700);
    playSound('click');

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
          {isSimulationMode ? 'Simulation Mode - Press and Hold the button to light up the LED! Release to turn it off ✨' : 'Make the Tactile Switch Connections ✨'}
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
      
      {/* Add Push on/off switch with Terminals between power supply and LED */}
      <g transform="rotate(0, 500, 500)"> 
        <image 
          href={switchboard}
          x="350"
          y="20"
          width="200"
          height="200"
          preserveAspectRatio="xMidYMid meet"
          transform="rotate(0, 600, 300)"
        />
        {/* Terminal 1 (T1) */}
        <rect
          x="420"
          y="200"
          width="20"
          height="20"
          fill={selectedNode?.id === 't1' ? '#ff6666' : '#FF0000'}
          stroke={selectedNode?.id === 't1' ? '#cc0000' : '#000'}
          strokeWidth="2"
          rx="3"
          style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
          onClick={() => handleNodeClick(circuitNodes[2])}
        />
        {/* Terminal 2 (T2) */}
        <rect
          x="445"
          y="200"
          width="20"
          height="20"
          fill={selectedNode?.id === 't2' ? '#ff6666' : '#FF0000'}
          stroke={selectedNode?.id === 't2' ? '#cc0000' : '#000'}
          strokeWidth="2"
          rx="3"
          style={{ cursor: isSimulationMode ? 'default' : 'pointer' }}
          onClick={() => handleNodeClick(circuitNodes[3])}
        />
      </g>
      
      {/* LED Board with Terminals */}
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
              onClick={() => handleNodeClick(circuitNodes[4])}
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
              onClick={() => handleNodeClick(circuitNodes[5])}
            />
           
        </g>

        {/* Wire Connections */}
        {connections.map((conn, index) => (
          <motion.path
            key={`${conn.from.id}-${conn.to.id}-${index}`}
            d={getWirePath(conn.from, conn.to)}
            stroke={getWireColor(conn.from, conn.to)}
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        ))}

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
            onClick={() => handleNodeClick(circuitNodes[4])}
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
            onClick={() => handleNodeClick(circuitNodes[5])}
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
                r={isPowerOn && isSwitchOn ? '50' : '5'}
                fill={isPowerOn && isSwitchOn ? 'url(#ledGradient)' : '#0cdbf8'}
                filter="url(#glow)"
                opacity="0.9"
              />
            </>
          )}
        </g>

        {/* Simulation Controls */}
        {isSimulationMode && (
          <g>
            {/* Power Supply Button */}
            <g transform="translate(650, 230)">
              <rect
                x="0"
                y="0"
                width="40"
                height="40"
                fill={isPowerOn ? '#4CAF50' : '#f44336'}
                stroke="#000"
                strokeWidth="1"
                rx="10"
                style={{ cursor: 'pointer' }}
                onClick={handlePowerToggle}
              />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {isPowerOn ? 'ON' : 'OFF'}
              </text>
            </g>

            {/* Switch Button */}
            <g transform="translate(420, 40)">
              <rect
                x="0"
                y="0"
                width="50"
                height="50"
                fill={isSwitchOn ? '#4CAF50' : '#f44336'}
                stroke="#000"
                strokeWidth="1"
                rx="50"
                style={{ cursor: isPowerOn ? 'pointer' : 'not-allowed', opacity: isPowerOn ? 1 : 0.5 }}
                onMouseDown={handleSwitchMouseDown}
                onMouseUp={handleSwitchMouseUp}
                onMouseLeave={handleSwitchMouseLeave}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleSwitchMouseDown();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSwitchMouseUp();
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  handleSwitchMouseLeave();
                }}
              />
              <text
                x="25"
                y="25"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {isSwitchOn ? 'ON' : 'OFF'}
              </text>
            </g>
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
                <p>Choose your connection pattern! You can either:</p>
                <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                  <li>Start with 5V → Switch → LED+ → LED- → GND</li>
                  <li>Or start with GND → Switch → LED- → LED+ → 5V</li>
                </ul>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">3.</span>
                <p>Click on either the red (5V) or black (GND) terminal to start your chosen pattern! ⚡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">4.</span>
                <p>Connect to either T1 or T2 of the switch! 🔄</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">5.</span>
                <p>Complete the circuit by connecting to the LED terminals in the correct order! 💡</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm sm:text-base">6.</span>
                <p>Once all connections are made, you can enter simulation mode and control the LED! 🎮</p>
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold text-sm sm:text-base">💡 Tips:</p>
                <ul className="list-disc list-inside mt-2 text-blue-700 text-sm sm:text-base space-y-1">
                  <li>Follow the color coding: red for positive (5V), black for negative (GND)</li>
                  <li>You can click a terminal again to remove its connection</li>
                  <li>Use the Reset button if you want to start over</li>
                  <li>Make sure the battery is in position before completing the circuit</li>
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
              <div className="animate-spin">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="animate-spin">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="animate-spin">
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