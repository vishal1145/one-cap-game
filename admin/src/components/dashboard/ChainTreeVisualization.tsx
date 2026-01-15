import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Users, Share2, Crown, Zap } from "lucide-react";

interface ChainNode {
  id: string;
  name: string;
  avatar: string;
  isPro: boolean;
  shares: number;
  children: ChainNode[];
  depth: number;
  x?: number;
  y?: number;
}

// Sample chain data
const sampleChainData: ChainNode = {
  id: "root",
  name: "Sarah Chen",
  avatar: "SC",
  isPro: true,
  shares: 156,
  depth: 0,
  children: [
    {
      id: "1-1",
      name: "Marcus J.",
      avatar: "MJ",
      isPro: true,
      shares: 45,
      depth: 1,
      children: [
        {
          id: "2-1",
          name: "Emily R.",
          avatar: "ER",
          isPro: false,
          shares: 12,
          depth: 2,
          children: [
            { id: "3-1", name: "Alex K.", avatar: "AK", isPro: false, shares: 3, depth: 3, children: [] },
            { id: "3-2", name: "Jordan L.", avatar: "JL", isPro: true, shares: 8, depth: 3, children: [] },
          ],
        },
        {
          id: "2-2",
          name: "James W.",
          avatar: "JW",
          isPro: false,
          shares: 18,
          depth: 2,
          children: [
            { id: "3-3", name: "Mia T.", avatar: "MT", isPro: false, shares: 5, depth: 3, children: [] },
          ],
        },
      ],
    },
    {
      id: "1-2",
      name: "Aisha P.",
      avatar: "AP",
      isPro: true,
      shares: 67,
      depth: 1,
      children: [
        {
          id: "2-3",
          name: "David H.",
          avatar: "DH",
          isPro: false,
          shares: 23,
          depth: 2,
          children: [
            { id: "3-4", name: "Sofia M.", avatar: "SM", isPro: true, shares: 11, depth: 3, children: [] },
            { id: "3-5", name: "Leo C.", avatar: "LC", isPro: false, shares: 4, depth: 3, children: [] },
            { id: "3-6", name: "Emma B.", avatar: "EB", isPro: false, shares: 2, depth: 3, children: [] },
          ],
        },
        {
          id: "2-4",
          name: "Ryan K.",
          avatar: "RK",
          isPro: true,
          shares: 34,
          depth: 2,
          children: [
            { id: "3-7", name: "Olivia N.", avatar: "ON", isPro: false, shares: 7, depth: 3, children: [] },
          ],
        },
      ],
    },
    {
      id: "1-3",
      name: "Chris M.",
      avatar: "CM",
      isPro: false,
      shares: 28,
      depth: 1,
      children: [
        {
          id: "2-5",
          name: "Nina S.",
          avatar: "NS",
          isPro: true,
          shares: 15,
          depth: 2,
          children: [],
        },
      ],
    },
  ],
};

interface NodePosition {
  node: ChainNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function calculatePositions(
  node: ChainNode,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number,
  positions: NodePosition[],
  parentX?: number,
  parentY?: number
): number {
  positions.push({ node, x, y, parentX, parentY });

  if (node.children.length === 0) {
    return x;
  }

  let currentX = x - ((node.children.length - 1) * horizontalSpacing) / 2;
  
  node.children.forEach((child, index) => {
    const childX = currentX + index * horizontalSpacing;
    calculatePositions(
      child,
      childX,
      y + verticalSpacing,
      horizontalSpacing * 0.7,
      verticalSpacing,
      positions,
      x,
      y
    );
  });

  return x;
}

interface ChainTreeVisualizationProps {
  chainId?: string;
}

export function ChainTreeVisualization({ chainId = "4821" }: ChainTreeVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<ChainNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 800;
  const height = 500;
  const nodeRadius = 24;
  const horizontalSpacing = 120;
  const verticalSpacing = 100;

  const positions: NodePosition[] = [];
  calculatePositions(
    sampleChainData,
    width / 2,
    60,
    horizontalSpacing,
    verticalSpacing,
    positions
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(2, Math.max(0.5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as Element).tagName === "svg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (node: ChainNode) => {
    if (node.depth === 0) return "hsl(var(--accent))";
    if (node.isPro) return "hsl(var(--warning))";
    if (node.shares > 10) return "hsl(var(--primary))";
    return "hsl(var(--muted-foreground))";
  };

  const getNodeGlow = (node: ChainNode) => {
    if (node.depth === 0) return "drop-shadow(0 0 12px hsl(var(--accent) / 0.6))";
    if (node.isPro) return "drop-shadow(0 0 8px hsl(var(--warning) / 0.5))";
    if (node.shares > 10) return "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))";
    return "none";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Chain #{chainId} Tree</h3>
          <p className="text-sm text-muted-foreground">
            {positions.length} participants • Scroll to zoom, drag to pan
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Starter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Pro User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Viral (10+ shares)</span>
          </div>
        </div>
      </div>

      {/* Visualization Container */}
      <div
        ref={containerRef}
        className="relative bg-muted/30 rounded-xl border border-border overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: "500px" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: "center",
          }}
        >
          {/* Connections */}
          <g>
            {positions.map((pos) => {
              if (pos.parentX !== undefined && pos.parentY !== undefined) {
                const isHovered =
                  hoveredNode === pos.node.id ||
                  positions.find((p) => p.x === pos.parentX && p.y === pos.parentY)?.node.id === hoveredNode;

                return (
                  <g key={`line-${pos.node.id}`}>
                    {/* Glow effect */}
                    <path
                      d={`M ${pos.parentX} ${pos.parentY + nodeRadius} 
                          Q ${pos.parentX} ${(pos.parentY + pos.y) / 2} 
                            ${(pos.parentX + pos.x) / 2} ${(pos.parentY + pos.y) / 2}
                          Q ${pos.x} ${(pos.parentY + pos.y) / 2}
                            ${pos.x} ${pos.y - nodeRadius}`}
                      fill="none"
                      stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={isHovered ? 3 : 2}
                      strokeOpacity={isHovered ? 0.8 : 0.5}
                      className="transition-all duration-300"
                    />
                    {/* Animated particle */}
                    {isHovered && (
                      <circle r="3" fill="hsl(var(--primary))">
                        <animateMotion
                          dur="1.5s"
                          repeatCount="indefinite"
                          path={`M ${pos.parentX} ${pos.parentY + nodeRadius} 
                                Q ${pos.parentX} ${(pos.parentY + pos.y) / 2} 
                                  ${(pos.parentX + pos.x) / 2} ${(pos.parentY + pos.y) / 2}
                                Q ${pos.x} ${(pos.parentY + pos.y) / 2}
                                  ${pos.x} ${pos.y - nodeRadius}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              }
              return null;
            })}
          </g>

          {/* Nodes */}
          <g>
            {positions.map((pos, index) => {
              const isHovered = hoveredNode === pos.node.id;
              const isSelected = selectedNode?.id === pos.node.id;
              const nodeColor = getNodeColor(pos.node);
              const nodeGlow = getNodeGlow(pos.node);

              return (
                <g
                  key={pos.node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(pos.node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(pos.node)}
                  style={{
                    filter: isHovered || isSelected ? nodeGlow : "none",
                    transition: "filter 0.3s ease",
                  }}
                >
                  {/* Pulse animation for root */}
                  {pos.node.depth === 0 && (
                    <circle
                      r={nodeRadius + 8}
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="2"
                      opacity="0.3"
                    >
                      <animate
                        attributeName="r"
                        values={`${nodeRadius};${nodeRadius + 15};${nodeRadius}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node background */}
                  <circle
                    r={nodeRadius}
                    fill="hsl(var(--card))"
                    stroke={nodeColor}
                    strokeWidth={isHovered || isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Avatar text */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize="10"
                    fontWeight="600"
                    fill={nodeColor}
                  >
                    {pos.node.avatar}
                  </text>

                  {/* Pro badge */}
                  {pos.node.isPro && (
                    <g transform={`translate(${nodeRadius - 4}, ${-nodeRadius + 4})`}>
                      <circle r="8" fill="hsl(var(--warning))" />
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize="8"
                      >
                        👑
                      </text>
                    </g>
                  )}

                  {/* Shares count badge */}
                  {pos.node.shares > 0 && (
                    <g transform={`translate(0, ${nodeRadius + 12})`}>
                      <text
                        textAnchor="middle"
                        fontSize="10"
                        fill="hsl(var(--muted-foreground))"
                      >
                        {pos.node.shares} shares
                      </text>
                    </g>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g transform="translate(35, -15)">
                      <rect
                        x="0"
                        y="-12"
                        width="90"
                        height="45"
                        rx="6"
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                      <text x="8" y="2" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">
                        {pos.node.name}
                      </text>
                      <text x="8" y="18" fontSize="9" fill="hsl(var(--muted-foreground))">
                        Depth: {pos.node.depth} • {pos.node.shares} shares
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-1">
          <button
            onClick={() => setScale((prev) => Math.min(2, prev * 1.2))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-foreground"
          >
            +
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.max(0.5, prev * 0.8))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-foreground"
          >
            −
          </button>
          <button
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground text-xs"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-card rounded-xl border border-border p-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: `${getNodeColor(selectedNode)}20`,
                  color: getNodeColor(selectedNode),
                }}
              >
                {selectedNode.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{selectedNode.name}</h4>
                  {selectedNode.isPro && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Depth {selectedNode.depth} in chain
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xl font-bold">{selectedNode.shares}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-accent">
                  <Users className="w-4 h-4" />
                  <span className="text-xl font-bold">{selectedNode.children.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Invites</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
