import { useNavigate } from "react-router-dom";
import { useFullscreen } from "../FullscreenContext";
import { useSound } from "../SoundContext";
import powerSupplyBoard from "../assets/power supply board.svg";
import ledboard from "../assets/led board.svg";
import battery from "../assets/9vbattery long.svg";
import LimitSwitch from "../assets/Limit Switch.svg";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import "../index.css";
import { FaArrowLeft, FaUndo, FaPlay, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';

// Add these types at the top of the file
type CircuitNodeType =
  | "5V"
  | "GND"
  | "LED_POSITIVE"
  | "LED_NEGATIVE"
  | "COM"
  | "NO"
  | "NC";

// Wire path coordinates
const WIRE_PATHS = {
  // GND1 to LED1- with bend (both directions)
  GND1_TO_LED1: "M 520 215 L 480 215 L 480 240 L 480 290 L 415 290",  // Down, right, down
  LED1_TO_GND1: "M 405 290 L 480 290 L 480 240 L 480 215 L 520 215",  // Up, right, up

  // GND2 to LED2- with bend (both directions)
  GND2_TO_LED2: "M 660 215 L 700 215 L 700 240 L 700 290 L 777 290",  // Down, right, down
  LED2_TO_GND2: "M 777 290 L 700 290 L 700 240 L 700 215 L 660 215",  // Up, right, up

  // LED1+ to COM with bends (both directions)
  LED1_TO_COM: "M 385 280 L 385 320 L 575 320 L 575 350",  // Up, right, up
  COM_TO_LED1: "M 575 350 L 575 320 L 385 320 L 385 280",  // Down, left, down

  // LED2+ to NO with bends (both directions)
  LED2_TO_NO: "M 817 280 L 817 320 L 600 320 L 600 350",  // Up, right, up
  NO_TO_LED2: "M 600 350 L 600 320 L 817 320 L 817 280",  // Down, left, down

  // COM to 5V with bends (both directions)
  COM_TO_5V: "M 620 350 L 620 300 L 591 300 L 591 195",   // Up, right, upyy
  V5_TO_COM: "M 591 195 L 591 300 L 620 300 L 620 350"    // Down, left, down
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
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [switchPosition, setSwitchPosition] = useState<"left" | "right">("left");

  // Navigation handlers
  const handleNextExperiment = () => {
    setIsFullscreen(true);
    navigate('/experiment/8');
    playSound('click');
  };

  const handlePreviousExperiment = () => {
    setIsFullscreen(true);
    navigate('/experiment/6');
    playSound('click');
  };

  // Define circuit nodes
  const circuitNodes: CircuitNode[] = [
    { id: "5v", type: "5V", x: 581, y: 185 },
    { id: "gnd1", type: "GND", x: 510, y: 205 },
    { id: "gnd2", type: "GND", x: 650, y: 205 },
    { id: "led1_pos", type: "LED_POSITIVE", x: 375, y: 280 },
    { id: "led1_neg", type: "LED_NEGATIVE", x: 405, y: 280 },
    { id: "led2_pos", type: "LED_POSITIVE", x: 807, y: 281 },
    { id: "led2_neg", type: "LED_NEGATIVE", x: 777, y: 280 },
    { id: "switch_a", type: "COM", x: 565, y: 350 },
    { id: "switch_com", type: "COM", x: 615, y: 350 },
    { id: "switch_b", type: "NO", x: 590, y: 350 }
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
    navigate("/game ");
  };

  const handleBatteryClick = () => {
    if (isSimulationMode) return;
    setBatteryX((prev) => (prev === 700 ? 620 : 700));
    playSound('click');
    toast.success("Battery moved! 🔋", {
      duration: 2000,
      style: {
        background: "#4CAF50",
        color: "white",
        fontSize: "14px",
        padding: "5px 10px",
      },
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
      // GND to LED negative connections
      (node1.type === "GND" && node2.type === "LED_NEGATIVE") ||
      (node1.type === "LED_NEGATIVE" && node2.type === "GND") ||
      // LED positive to switch terminal connections
      (node1.id === "led1_pos" && node2.type === "COM") ||
      (node1.type === "COM" && node2.id === "led1_pos") ||
      (node1.id === "led2_pos" && node2.type === "NO") ||
      (node1.type === "NO" && node2.id === "led2_pos") ||
      // Switch COM to 5V connection
      (node1.type === "COM" && node2.type === "5V") ||
      (node1.type === "5V" && node2.type === "COM")
    );
  };

  const getWirePath = (from: CircuitNode, to: CircuitNode) => {
    // GND to LED- connections
    if (
      (from.type === "GND" && to.type === "LED_NEGATIVE") ||
      (to.type === "GND" && from.type === "LED_NEGATIVE")
    ) {
      // Determine which GND terminal is involved
      if (from.id === "gnd1" || to.id === "gnd1") {
        return from.type === "GND" ? WIRE_PATHS.GND1_TO_LED1 : WIRE_PATHS.LED1_TO_GND1;
      } else {
        return from.type === "GND" ? WIRE_PATHS.GND2_TO_LED2 : WIRE_PATHS.LED2_TO_GND2;
      }
    }

    // LED+ to Switch A/B connections
    if (
      (from.id === "led1_pos" && to.type === "COM") ||
      (to.id === "led1_pos" && from.type === "COM")
    ) {
      return from.id === "led1_pos" ? WIRE_PATHS.LED1_TO_COM : WIRE_PATHS.COM_TO_LED1;
    }

    if (
      (from.id === "led2_pos" && to.type === "NO") ||
      (to.id === "led2_pos" && from.type === "NO")
    ) {
      return from.id === "led2_pos" ? WIRE_PATHS.LED2_TO_NO : WIRE_PATHS.NO_TO_LED2;
    }

    // Switch COM to 5V connection
    if (
      (from.type === "COM" && to.type === "5V") ||
      (to.type === "COM" && from.type === "5V")
    ) {
      return from.type === "COM" ? WIRE_PATHS.COM_TO_5V : WIRE_PATHS.V5_TO_COM;
    }

    return `M ${from.x + 10} ${from.y + 10} L ${to.x + 10} ${to.y + 10}`;
  };


  // Update the circuit completion check
  useEffect(() => {
    // Check for all required connections
    const hasGnd1ToLed1 = connections.some(
      (conn) =>
        (conn.from.id === "gnd1" && conn.to.id === "led1_neg") ||
        (conn.from.id === "led1_neg" && conn.to.id === "gnd1")
    );

    const hasGnd2ToLed2 = connections.some(
      (conn) =>
        (conn.from.id === "gnd2" && conn.to.id === "led2_neg") ||
        (conn.from.id === "led2_neg" && conn.to.id === "gnd2")
    );

    const hasLed1ToSwitchA = connections.some(
      (conn) =>
        (conn.from.id === "led1_pos" && conn.to.id === "switch_a") ||
        (conn.from.id === "switch_a" && conn.to.id === "led1_pos")
    );

    const hasLed2ToSwitchB = connections.some(
      (conn) =>
        (conn.from.id === "led2_pos" && conn.to.id === "switch_b") ||
        (conn.from.id === "switch_b" && conn.to.id === "led2_pos")
    );

    const hasSwitchComTo5V = connections.some(
      (conn) =>
        (conn.from.id === "switch_com" && conn.to.id === "5v") ||
        (conn.from.id === "5v" && conn.to.id === "switch_com")
    );

    // Check if all connections are made and battery is in correct position
    if (
      hasGnd1ToLed1 &&
      hasGnd2ToLed2 &&
      hasLed1ToSwitchA &&
      hasLed2ToSwitchB &&
      hasSwitchComTo5V &&
      batteryX === 620 &&
      !showSimulationButton
    ) {
      // Add a delay before showing success message
      setTimeout(() => {
        // Show success message
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

        // Trigger confetti and show simulation button
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
      toast.error('Invalid connection! Try connecting the relay switch correctly.', {
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
    setShowSimulationButton(false);
    setIsSimulationMode(false);
    setIsPowerOn(false);
    setBatteryX(700);
    setSwitchPosition("left");
    playSound('click');
  };

  const handleExitSimulation = () => {
    setIsSimulationMode(false);
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
            ? "Simulation Mode - Press the Limit Switch to see NO/NC LED behavior! 💡"
            : "Connect the Limit Switch Circuit - NO LED and NC LED! ✨"}
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
            <image
              href={ledboard}
              x="400"
              y="400"
              width="200"
              height="200"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(90, 600, 300)"
            />
          </g>
          <g transform="rotate(0, 500, 500)">
            <image
              href={ledboard}
              x="400"
              y="-200"
              width="200"
              height="200"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(90, 600, 300) scale(1, -1)"
            />
          </g>

          {/* Limit Switch */}
          <g transform="rotate(0, 500, 500)">
            <image
              href={LimitSwitch}
              x="503"
              y="96"
              width="180"
              height="180"
              preserveAspectRatio="xMidYMid meet"
              transform="rotate(180, 600, 300)"
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

            {/* GND 1 Terminal */}
            <rect
              x="510"
              y="205"
              width="20"
              height="20"
              fill={selectedNode?.id === "gnd1" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "gnd1" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[1])}
              id="gnd1_terminal"
            />

            {/* GND 2 Terminal */}
            <rect
              x="650"
              y="205"
              width="20"
              height="20"
              fill={selectedNode?.id === "gnd2" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "gnd2" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[2])}
              id="gnd2_terminal"
            />
          </g>

          {/* LED terminals */}
          <g>
            {/* LED 1 terminals */}
            <rect
              x="375"
              y="280"
              width="20"
              height="20"
              fill={selectedNode?.id === "led1_pos" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "led1_pos" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[3])}
              id="led1_pos_terminal"
            />
            <rect
              x="405"
              y="280"
              width="20"
              height="20"
              fill={selectedNode?.id === "led1_neg" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "led1_neg" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[4])}
              id="led1_neg_terminal"
            />

            {/* LED 2 terminals */}
            <rect
              x="807"
              y="281"
              width="20"
              height="20"
              fill={selectedNode?.id === "led2_pos" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "led2_pos" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[5])}
              id="led2_pos_terminal"
            />
            <rect
              x="777"
              y="280"
              width="20"
              height="20"
              fill={selectedNode?.id === "led2_neg" ? "#666666" : "#000000"}
              stroke={selectedNode?.id === "led2_neg" ? "#333333" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => handleNodeClick(circuitNodes[6])}
              id="led2_neg_terminal"
            />
          </g>

          {/* Switch terminals */}
          <g>
            {/* Original switch terminals - always visible */}
            <rect
              x="565"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch_a" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch_a" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[7])}
              id="switch_NC_terminal" 
            />
            <rect
              x="615"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch_com" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch_com" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[8])}
              id="switch_NO_terminal"
            />
            <rect
              x="590"
              y="350"
              width="20"
              height="20"
              fill={selectedNode?.id === "switch_b" ? "#ff6666" : "#FF0000"}
              stroke={selectedNode?.id === "switch_b" ? "#cc0000" : "#000"}
              strokeWidth="2"
              rx="3"
              style={{ cursor: isSimulationMode ? "default" : "pointer" }}
              onClick={() => !isSimulationMode && handleNodeClick(circuitNodes[9])}
              id="switch_COM_terminal"
            />

            {/* Push button in simulation mode */}
            {isSimulationMode && (
              <g transform="translate(530, 440)" style={{ opacity: isPowerOn ? 1 : 0.4 }}>
                {/* Button base (always visible) */}
                <circle
                  cx="25"
                  cy="25"
                  r="25"
                  fill="#d1d1d1"
                  stroke="#999999"
                  strokeWidth="2"
                />
                
                {/* Button top (moves when pressed) */}
                <g transform={`translate(0, ${switchPosition === "right" ? 3 : 0})`}>
                  <circle
                    cx="25"
                    cy="25"
                    r="22"
                    fill={switchPosition === "right" ? '#3d8c40' : '#4CAF50'}
                    stroke={switchPosition === "right" ? '#2E7D32' : '#45a049'}
                    strokeWidth="2"
                    style={{
                      cursor: isPowerOn ? "pointer" : "not-allowed",
                      transition: "all 0.05s ease-in-out",
                      filter: switchPosition === "right" ? "brightness(0.9)" : "brightness(1)"
                    }}
                    onMouseDown={() => isPowerOn && setSwitchPosition("right")}
                    onMouseUp={() => isPowerOn && setSwitchPosition("left")}
                    onMouseLeave={() => isPowerOn && setSwitchPosition("left")}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      isPowerOn && setSwitchPosition("right");
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      isPowerOn && setSwitchPosition("left");
                    }}
                    onTouchCancel={(e) => {
                      e.preventDefault();
                      isPowerOn && setSwitchPosition("left");
                    }}
                  />
                  <text
                    x="25"
                    y="30"
                    textAnchor="middle"
                    fill="#ffffff"
                    style={{
                      userSelect: "none",
                      pointerEvents: "none",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                    PUSH
                  </text>
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

          {/* LED Glow Effects - Only show when power is ON */}
          {isSimulationMode && isPowerOn && (
            <>
              {/* LED 1 Glow */}
              {switchPosition === "left" && (
                <circle
                  cx="400"
                  cy="130"
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
              {/* LED 2 Glow */}
              {switchPosition === "right" && (
                <circle
                  cx="800"
                  cy="130"
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
            </>
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
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Limit Switch Circuit Guide! 🎮
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
                    Click and move the battery closer to power up the circuit! 🔋
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    2.
                  </span>
                  <p>
                    Connect the 5V terminal (red) to the Switch COM terminal! ⚡
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    3.
                  </span>
                  <p>
                    Connect LED1's positive terminal to Switch NO (Normally Open) terminal! 💡
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    4.
                  </span>
                  <p>
                    Connect LED2's positive terminal to Switch NC (Normally Closed) terminal! 💡
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    5.
                  </span>
                  <p>
                    Connect LED1's negative terminal to GND1 (black)! ⚫
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    6.
                  </span>
                  <p>
                    Connect LED2's negative terminal to GND2 (black)! ⚫
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm sm:text-base">
                    7.
                  </span>
                  <p>
                    Enter simulation mode to test the limit switch behavior! 🎮
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-semibold text-sm sm:text-base">
                    💡 How it works:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-blue-700 text-sm sm:text-base space-y-1">
                    <li>
                      NO (Normally Open) LED lights up when switch is pressed
                    </li>
                    <li>
                      NC (Normally Closed) LED lights up when switch is not pressed
                    </li>
                    <li>
                      The limit switch changes state when pressed/released
                    </li>
                    <li>
                      This setup is commonly used in safety systems and sensors
                    </li>
                    <li>
                      Click a terminal again to remove its connection
                    </li>
                    <li>
                      Use Reset to start over or Exit Simulation to make new connections
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSimulationButton && !isSimulationMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-20">
            <div className="relative flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div
                  style={{
                    transform: "scale(1.0878) rotate(-23.8561deg)",
                    filter: "brightness(1.21949)",
                    animation: "spin 3s linear infinite",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div
                  style={{
                    transform: "scale(1.16019) rotate(-45.1312deg)",
                    filter: "brightness(1.40047)",
                    animation: "spin 3s linear infinite reverse",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div
                  style={{
                    transform: "scale(1.19343) rotate(-70.947deg)",
                    filter: "brightness(1.48358)",
                    animation: "spin 3s linear infinite",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play mr-2 h-5 w-5"
                >
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
