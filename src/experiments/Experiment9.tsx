import { useNavigate } from "react-router-dom";
import { useFullscreen } from "../FullscreenContext";
import { useSound } from "../SoundContext";
import powerSupplyBoard from "../assets/power supply board.svg";
import ledboard from "../assets/led board.svg";
import battery from "../assets/9vbattery long.svg";
import switchboard from "../assets/two way switch.svg";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import "../index.css";
import { FaArrowLeft, FaUndo, FaPlay, FaQuestionCircle, FaHome } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';

// Add these types at the top of the file
type CircuitNodeType =
  | "5V"
  | "GND"
  | "LED_POSITIVE"
  | "LED_NEGATIVE"
  | "SWITCH1_A"
  | "SWITCH1_COM"
  | "SWITCH1_B"
  | "SWITCH2_A"
  | "SWITCH2_COM"
  | "SWITCH2_B";

// Wire path coordinates
const WIRE_PATHS = {
  // GND to LED- with bend
  GND_TO_LED: "M 590 220 L 590 260 L 315 260 L 315 220",  // GND to LED-
  LED_TO_GND: "M 315 220 L 315 260 L 590 260 L 590 220",   // LED- to GND

  // 5V to Switch2 COM
  V5_TO_SWITCH2_COM: "M 581 200 L 700 200 L 700 360",  // 5V to Switch2 COM
  SWITCH2_COM_TO_5V: "M 700 360 L 700 200 L 581 200",  // Switch2 COM to 5V

  // Switch2 A to Switch1 B
  SWITCH2_A_TO_SWITCH1_B: "M 675 350 L 675 320 L 525 320 L 525 350",  // Switch2 A to Switch1 B
  SWITCH1_B_TO_SWITCH2_A: "M 525 350 L 525 320 L 675 320 L 675 350",  // Switch1 B to Switch2 A

  // Switch2 B to Switch1 A
  SWITCH2_B_TO_SWITCH1_A: "M 725 350 L 725 320 L 780 320 L 780 560 L 430 560 L 430 320 L 475 320 L 475 350",  // Switch2 B to Switch1 A
  SWITCH1_A_TO_SWITCH2_B: "M 475 350 L 475 320 L 430 320 L 430 560 L 780 560 L 780 320 L 725 320 L 725 350",   // Switch1 A to Switch2 B

  // Switch1 COM to LED positive
  SWITCH1_COM_TO_LED: "M 500 350 L 500 280 L 285 280 L 285 210",  // Switch1 COM to LED+
  LED_TO_SWITCH1_COM: "M 285 210 L 285 280 L 500 280 L 500 350"   // LED+ to Switch1 COM
};

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
  const [switch1Position, setSwitch1Position] = useState<"left" | "right">("left");
  const [switch2Position, setSwitch2Position] = useState<"left" | "right">("left");

  // Navigation handlers
  const handleNextExperiment = () => {
    setIsFullscreen(true);
    navigate('/');
    playSound('click');
  };

  const handlePreviousExperiment = () => {
    setIsFullscreen(true);
    navigate('/experiment/8');
    playSound('click');
  };

  // Define circuit nodes
  const circuitNodes: CircuitNode[] = [
    { id: "5v", type: "5V", x: 581, y: 185 },
    { id: "gnd", type: "GND", x: 591, y: 309 },
    { id: "led_pos", type: "LED_POSITIVE", x: 275, y: 200 },
    { id: "led_neg", type: "LED_NEGATIVE", x: 305, y: 200 },
    { id: "switch1_a", type: "SWITCH1_A", x: 565, y: 270 },
    { id: "switch1_com", type: "SWITCH1_COM", x: 590, y: 270 },
    { id: "switch1_b", type: "SWITCH1_B", x: 615, y: 270 },
    { id: "switch2_a", type: "SWITCH2_A", x: 565, y: 320 },
    { id: "switch2_com", type: "SWITCH2_COM", x: 590, y: 320 },
    { id: "switch2_b", type: "SWITCH2_B", x: 615, y: 320 }
  ];

  // Enhanced fullscreen handling
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          if (
            "orientation" in screen &&
            screen.orientation &&
            "lock" in screen.orientation
          ) {
            await (screen.orientation as any).lock("landscape");
          }
        }
        setIsFullscreenState(true);
      } catch (err) {
        console.error("Error entering fullscreen:", err);
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
      if ("wakeLock" in navigator) {
        try {
          await (navigator as any).wakeLock.request("screen");
        } catch (err) {
          console.error("Error requesting wake lock:", err);
        }
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Request wake lock
    handleWakeLock();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [setIsFullscreen]);

  const handleBack = () => {
    setIsFullscreen(true);
    navigate("/game");
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
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const canConnect = (node1: CircuitNode, node2: CircuitNode) => {
    // Allow connections based on the specified wiring
    return (
      // GND to LED negative connection
      (node1.type === "GND" && node2.type === "LED_NEGATIVE") ||
      (node1.type === "LED_NEGATIVE" && node2.type === "GND") ||
      
      // 5V to Switch2 COM connection
      (node1.type === "5V" && node2.type === "SWITCH2_COM") ||
      (node1.type === "SWITCH2_COM" && node2.type === "5V") ||
      
      // Switch2 A to Switch1 B connection
      (node1.type === "SWITCH2_A" && node2.type === "SWITCH1_B") ||
      (node1.type === "SWITCH1_B" && node2.type === "SWITCH2_A") ||
      
      // Switch2 B to Switch1 A connection
      (node1.type === "SWITCH2_B" && node2.type === "SWITCH1_A") ||
      (node1.type === "SWITCH1_A" && node2.type === "SWITCH2_B") ||

      // Switch1 COM to LED positive connection
      (node1.type === "SWITCH1_COM" && node2.type === "LED_POSITIVE") ||
      (node1.type === "LED_POSITIVE" && node2.type === "SWITCH1_COM")
    );
  };

  const getWirePath = (from: CircuitNode, to: CircuitNode) => {
    // GND to LED- connection
    if (
      (from.type === "GND" && to.type === "LED_NEGATIVE") ||
      (to.type === "GND" && from.type === "LED_NEGATIVE")
    ) {
      return from.type === "GND" ? WIRE_PATHS.GND_TO_LED : WIRE_PATHS.LED_TO_GND;
    }

    // 5V to Switch2 COM connection
    if (
      (from.type === "5V" && to.type === "SWITCH2_COM") ||
      (to.type === "5V" && from.type === "SWITCH2_COM")
    ) {
      return from.type === "5V" ? WIRE_PATHS.V5_TO_SWITCH2_COM : WIRE_PATHS.SWITCH2_COM_TO_5V;
    }

    // Switch2 A to Switch1 B connection
    if (
      (from.type === "SWITCH2_A" && to.type === "SWITCH1_B") ||
      (to.type === "SWITCH2_A" && from.type === "SWITCH1_B")
    ) {
      return from.type === "SWITCH2_A" ? WIRE_PATHS.SWITCH2_A_TO_SWITCH1_B : WIRE_PATHS.SWITCH1_B_TO_SWITCH2_A;
    }

    // Switch2 B to Switch1 A connection
    if (
      (from.type === "SWITCH2_B" && to.type === "SWITCH1_A") ||
      (to.type === "SWITCH2_B" && from.type === "SWITCH1_A")
    ) {
      return from.type === "SWITCH2_B" ? WIRE_PATHS.SWITCH2_B_TO_SWITCH1_A : WIRE_PATHS.SWITCH1_A_TO_SWITCH2_B;
    }

    // Switch1 COM to LED positive connection
    if (
      (from.type === "SWITCH1_COM" && to.type === "LED_POSITIVE") ||
      (to.type === "SWITCH1_COM" && from.type === "LED_POSITIVE")
    ) {
      return from.type === "SWITCH1_COM" ? WIRE_PATHS.SWITCH1_COM_TO_LED : WIRE_PATHS.LED_TO_SWITCH1_COM;
    }

    return `M ${from.x + 10} ${from.y + 10} L ${to.x + 10} ${to.y + 10}`;
  };


  // Update the circuit completion check
  useEffect(() => {
    // Helper function to check if a connection exists between two nodes
    const hasConnection = (node1Id: string, node2Id: string) => {
      return connections.some(conn =>
        (conn.from.id === node1Id && conn.to.id === node2Id) ||
        (conn.from.id === node2Id && conn.to.id === node1Id)
      );
    };

    // Check all required connections for the staircase circuit
    const hasGndToLedNeg = hasConnection("gnd", "led_neg");
    const hasSwitch1ComToLedPos = hasConnection("switch1_com", "led_pos");
    const hasSwitch2ComTo5V = hasConnection("switch2_com", "5v");
    const hasSwitch2AToSwitch1B = hasConnection("switch2_a", "switch1_b");
    const hasSwitch2BToSwitch1A = hasConnection("switch2_b", "switch1_a");

    // Check if all connections are made and battery is in correct position
    if (
      hasGndToLedNeg &&
      hasSwitch1ComToLedPos &&
      hasSwitch2ComTo5V &&
      hasSwitch2AToSwitch1B &&
      hasSwitch2BToSwitch1A &&
      batteryX === 620 &&
      !showSimulationButton
    ) {
      setTimeout(() => {
        playSound('success');
        toast.success("Circuit complete! Ready for simulation! ✨", {
          duration: 2000,
          style: {
            background: "#4CAF50",
            color: "white",
            fontSize: "14px",
            padding: "5px 10px",
          },
          icon: "✨",
        });
        triggerConfetti();
        setShowSimulationButton(true);
      }, 500);
    }
  }, [connections, batteryX, showSimulationButton, triggerConfetti, playSound]);

  const handlePowerToggle = () => {
    if (!isSimulationMode) return;
    setIsPowerOn(!isPowerOn);
    playSound('click');
    toast.success(`Power ${!isPowerOn ? 'on' : 'off'}! ⚡`, {
      duration: 2000,
      style: {
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '5px 10px',
      }
    });
  };

  const handleSwitch1Toggle = () => {
    if (!isSimulationMode || !isPowerOn) return;
    
    const newPosition = switch1Position === "left" ? "right" : "left";
    setSwitch1Position(newPosition);
    playSound('click');
  };

  const handleSwitch2Toggle = () => {
    if (!isSimulationMode || !isPowerOn) return;
    
    const newPosition = switch2Position === "left" ? "right" : "left";
    setSwitch2Position(newPosition);
    playSound('click');
  };

  const handleSimulationMode = () => {
    setIsSimulationMode(true);
    setIsPowerOn(true);
    playSound('success');
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
      toast.error('Invalid connection! Try connecting the switch in series.', {
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

  const handleReset = () => {
    setConnections([]);
    setSelectedNode(null);
    setShowSimulationButton(false);
    setIsSimulationMode(false);
    setIsPowerOn(true);
    setBatteryX(700);
    setSwitch1Position("left");
    setSwitch2Position("left");
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

  const handleExitSimulation = () => {
    setIsSimulationMode(false);
    setSwitch1Position("left");
    setSwitch2Position("left");
    handleReset();
  };

  return (
    <div
      style={{ userSelect: "none" }}
      className="min-h-screen min-w-screen bg-white flex flex-col overflow-hidden fixed inset-0 p-2"
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1000,
          style: {
            background: "#4CAF50",
            color: "white",
            fontSize: "12px",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        }}
      />
      {/* Title Section - 10vh */}
      <div className="bg-blue-200 h-[10vh] flex items-center -full border-b border-blue-200 p-5 rounded-md">
        <p className="text-center text-black-800 text-lg font-semibold">
          {isSimulationMode
            ? "Simulation Mode - Control the LED from two different locations! 🏃‍♂️"
            : "Staircase Wiring: Connect Two-Way Switches to Control One LED! ✨"}
        </p>
      </div>

      <div className="items-center justify-center w-full h-[90vh] bg-gray-50 relative">
        <svg
          className={`w-full h-full transition-all duration-300 ${
            showSimulationButton && !isSimulationMode ? "blur-md" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 650"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient
              id="ledGradient"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#ffffff", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#0cdbf8", stopOpacity: 1 }}
              />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Battery */}
          <motion.image
            href={battery}
            initial={{ x: 700 }}
            animate={{ x: batteryX }}
            y="40"
            width="500"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            onClick={handleBatteryClick}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{ cursor: isSimulationMode ? "default" : "pointer" }}
          />

          {/* Power Supply board */}
          <g transform="rotate(0, 400, 500)">
            <image
              href={powerSupplyBoard}
              x="650"
              y="200"
              width="200"
              height="200"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(270, 600, 300)"
            />
          </g>

          {/* LED boards */}
          <g transform="rotate(0, 500, 500)">
            {/* Single LED board */}
            <image 
              href={ledboard} 
              x="320" 
              y="500"
              width="200" 
              height="200" 
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(90, 600, 300)"
            />
            
            {/* First Switch */}
            <image
              href={switchboard}
              x="350"
              y="100"
              width="200"
              height="200"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(270, 600, 300)"
            />

            {/* Second Switch */}
            <image
              href={switchboard}
              x="350"
              y="300"
              width="200"
              height="200"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(270, 600, 300)"
            />
          </g>

          {/* Render all connections with animation - Now after the boards */}
          {connections.map((connection, index) => (
            <motion.path
              key={`${connection.from.id}-${connection.to.id}-${index}`}
              d={getWirePath(connection.from, connection.to)}
              stroke={connection.from.type.includes("GND") || connection.to.type.includes("GND") ? "#000000" : "#FF0000"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          ))}

          {/* All terminals - Now at the very top */}
          <g transform="rotate(0, 400, 500)">
            {/* 5V Terminal */}
            <rect
              x="581"
              y="185"
              width="20"
              height="20"
              fill={selectedNode?.id === "5v" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "5v" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[0])}
              id="5v_terminal"
            />

            {/* GND Terminal */}
            <rect
              x="581"
              y="210"
              width="20"
              height="20"
              fill={selectedNode?.id === "gnd" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "gnd" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[1])}
              id="gnd_terminal"
            />
          </g>

          {/* LED terminals */}
          <g>
            {/* LED 1 terminals */}
            <rect
              x="275"
              y="200"
              width="20"
              height="20"
              fill={selectedNode?.id === "led_pos" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "led_pos" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[2])}
              id="led_pos_terminal"
            />
            <rect
              x="305"
              y="200"
              width="20"
              height="20"
              fill={selectedNode?.id === "led_neg" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "led_neg" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[3])}
              id="led_neg_terminal"
            />
          </g>

          {/* Switch terminals */}
          <g>
            {/* First switch terminals */}
            <rect
              x="465"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch1_a" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch1_a" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[4])}
              id="switch1_a_terminal"
            />
            <rect
              x="490"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch1_com" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch1_com" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[5])}
              id="switch1_com_terminal"
            />
            <rect
              x="515"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch1_b" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch1_b" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[6])}
              id="switch1_b_terminal"
            />

            {/* Second switch terminals */}
            <rect
              x="665"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch2_a" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch2_a" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[7])}
              id="switch2_a_terminal"
            />
            <rect
              x="690"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch2_com" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch2_com" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[8])}
              id="switch2_com_terminal"
            />
            <rect
              x="715"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch2_b" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch2_b" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[9])}
              id="switch2_b_terminal"
            />

            {/* Toggle switches in simulation mode - appears on top */}
            {isSimulationMode && (
              <g>
                {/* First two-way switch */}
                <g transform="translate(465, 490)">
                  <rect
                    width="70"
                    height="30"
                    fill="#e0e0e0"
                    stroke="#cccccc"
                    strokeWidth="2"
                    rx="5"
                  />
                  <rect
                    x={switch1Position === "left" ? "0" : "50"}
                    width="20"
                    height="30"
                    fill="#4CAF50"
                    stroke="#2E7D32"
                    strokeWidth="2"
                    rx="5"
                    style={{ 
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out"
                    }}
                    onClick={handleSwitch1Toggle}
                  />
                </g>

                {/* Second two-way switch */}
                <g transform="translate(665, 490)">
                  <rect
                    width="70"
                    height="30"
                    fill="#e0e0e0"
                    stroke="#cccccc"
                    strokeWidth="2"
                    rx="5"
                  />
                  <rect
                    x={switch2Position === "left" ? "0" : "50"}
                    width="20"
                    height="30"
                    fill="#4CAF50"
                    stroke="#2E7D32"
                    strokeWidth="2"
                    rx="5"
                    style={{ 
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out"
                    }}
                    onClick={handleSwitch2Toggle}
                  />
                </g>
              </g>
            )}
          </g>

          {/* Power Supply Button */}
          {isSimulationMode && (
            <g transform="translate(650, 130)">
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
          )}

          {/* Single LED Glow Effect - Only show when power is ON and switches are in correct position */}
          {isSimulationMode && isPowerOn && (
            (switch1Position === "left" && switch2Position === "left") || 
            (switch1Position === "right" && switch2Position === "right")
          ) && (
            <circle
              cx="300"
              cy="50"
              r="50"
              fill="url(#ledGradient)"
              filter="url(#glow)"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.8;0.6;0.8"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
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
        <FaHome className="h-3.5 w-3.5" />
        <span className="hidden sm:inline text-xs">Home</span>
      </button>

      </div>
    </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-[95%] sm:max-w-md w-full shadow-xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Staircase Circuit Guide! 🏠
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    1.
                  </span>
                  <p>
                    Move the battery closer to power up the circuit! 🔋
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    2.
                  </span>
                  <p>
                    Connect the power supply (5V) to Switch 1's COM terminal! ⚡
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    3.
                  </span>
                  <p>
                    Connect Switch 1's terminals to Switch 2: 🔄
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                    <li>Switch 1 Terminal A → Switch 2 Terminal A</li>
                    <li>Switch 1 Terminal B → Switch 2 Terminal B</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    4.
                  </span>
                  <p>
                    Connect Switch 2's COM terminal to LED positive (+)! 💡
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    5.
                  </span>
                  <p>
                    Complete the circuit by connecting LED negative (-) to GND! ⚫
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-semibold text-sm sm:text-base">
                    💡 How it works:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-blue-700 text-sm sm:text-base space-y-1">
                    <li>
                      This is a real staircase wiring setup used in buildings
                    </li>
                    <li>
                      You can control the LED from two different locations
                    </li>
                    <li>
                      Flipping either switch will toggle the LED state
                    </li>
                    <li>
                      Both switches must be in matching positions for the LED to light up
                    </li>
                    <li>
                      Click a terminal again to remove its connection
                    </li>
                    <li>
                      Use Reset to start over or Exit to make new connections
                    </li>
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
            onClick={() => {
              setIsFullscreen(true);
              document.documentElement.requestFullscreen();
            }}
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
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
