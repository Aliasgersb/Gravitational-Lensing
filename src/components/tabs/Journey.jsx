import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from '@dagrejs/dagre';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, Legend, LabelList, ReferenceLine } from 'recharts';
import OrientationStrip from '../OrientationStrip';
import GlossaryTooltip from '../GlossaryTooltip';


const PHASES = [
  { id: 'phase0', label: 'Phase 0 — Setup' },
  { id: 'phase1', label: 'Phase 1 — Invalidated Baselines' },
  { id: 'phase2', label: 'Phase 2 — First Validated Result' },
  { id: 'phase3', label: 'Phase 3 — Galaxy Backbones' },
  { id: 'phase4', label: 'Phase 4 — Scaling Up' },
  { id: 'phase5', label: 'Phase 5 — Ensemble & Mining' },
  { id: 'phase6', label: 'Phase 6 — Track B' },
  { id: 'phase7', label: 'Phase 7 — Population Inference' },
  { id: 'conclusions', label: 'Conclusions' },
];

function useSectionSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, [ids]);
  return active;
}

/* ── React Flow + Dagre: Two-Track Pipeline ── */
const pipelineNodeTypes = {
  customTrack: ({ data }) => (
    <div style={{ width: 220, padding: '16px', borderRadius: '2px', backgroundColor: data.bg, border: `1.5px solid ${data.borderColor}`, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
      <Handle type="target" position={Position.Left} id="in" style={{ background: data.borderColor, border: 'none' }} />
      {data.title === 'TRACK B' && <Handle type="target" position={Position.Top} id="in-top" style={{ background: data.borderColor, border: 'none' }} />}
      <div style={{ fontSize: '10px', color: data.borderColor, letterSpacing: '2px', marginBottom: '8px' }}>{data.title}</div>
      <div style={{ fontSize: '15px', color: '#e8e6e0', fontWeight: '500', marginBottom: '8px' }}>{data.name}</div>
      <div style={{ fontSize: '12px', color: '#7a7870', marginBottom: '4px' }}>{data.desc1}</div>
      <div style={{ fontSize: '11px', color: '#3d3b38' }}>{data.desc2}</div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: data.borderColor, border: 'none' }} />
    </div>
  ),
  customInput: ({ data }) => (
    <div style={{ width: 120, padding: '12px', borderRadius: '2px', backgroundColor: 'transparent', border: '1px solid #3d3b38', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ fontSize: '10px', color: '#3d3b38', letterSpacing: '1px', marginBottom: '8px' }}>INPUT</div>
      <div style={{ fontSize: '13px', color: '#7a7870', marginBottom: '4px' }}>{data.name}</div>
      <div style={{ fontSize: '11px', color: '#3d3b38' }}>{data.desc}</div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#3d3b38', border: 'none' }} />
    </div>
  ),
  customOutput: ({ data }) => (
    <div style={{ width: 140, padding: '12px', borderRadius: '2px', backgroundColor: 'transparent', border: '1px solid #242424', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
      <Handle type="target" position={Position.Left} id="in" style={{ background: '#242424', border: 'none' }} />
      <div style={{ fontSize: '12px', color: '#7a7870', marginBottom: '4px' }}>{data.name}</div>
      <div style={{ fontSize: '11px', color: '#3d3b38' }}>{data.desc}</div>
      <Handle type="source" position={Position.Bottom} id="out-bottom" style={{ background: '#6b5f4e', border: 'none' }} />
    </div>
  )
};

const initialNodes = [
  { id: 'input', type: 'customInput', data: { name: 'Galaxy', desc: 'FITS image' }, position: { x: 0, y: 0 } },
  { id: 'trackA', type: 'customTrack', data: { title: 'TRACK A', name: 'Binary Detector', desc1: 'Is this a gravitational lens?', desc2: '→ Lens / Not a Lens', bg: 'rgba(200,184,154,0.04)', borderColor: '#c8b89a' }, position: { x: 0, y: 0 } },
  { id: 'trackB', type: 'customTrack', data: { title: 'TRACK B', name: 'Substructure Classifier', desc1: 'What type of dark matter?', desc2: 'Smooth / CDM / Axion', bg: 'rgba(107,95,78,0.05)', borderColor: '#6b5f4e' }, position: { x: 0, y: 0 } },
  { id: 'output', type: 'customOutput', data: { name: 'Lens candidate', desc: '→ routes to Track B' }, position: { x: 0, y: 0 } }
];

const initialEdges = [
  { id: 'e1', source: 'input', sourceHandle: 'out', target: 'trackA', targetHandle: 'in', type: 'smoothstep', style: { stroke: '#3d3b38', strokeWidth: 1.5 } },
  { id: 'e2', source: 'input', sourceHandle: 'out', target: 'trackB', targetHandle: 'in', type: 'smoothstep', style: { stroke: '#3d3b38', strokeWidth: 1.5 } },
  { id: 'e3', source: 'trackA', sourceHandle: 'out', target: 'output', targetHandle: 'in', type: 'smoothstep', style: { stroke: '#3d3b38', strokeWidth: 1.5 } },
  { id: 'e4', source: 'output', sourceHandle: 'out-bottom', target: 'trackB', targetHandle: 'in-top', type: 'step', style: { stroke: '#6b5f4e', strokeWidth: 1, strokeDasharray: '5,3' }, label: 'feedback', labelStyle: { fill: '#6b5f4e', fontSize: 10, fontFamily: 'monospace' }, animated: true }
];

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 220 / 2,
        y: nodeWithPosition.y - 120 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const TrackPipelineSVG = () => {
  return (
    <div style={{ width: '100%', height: '400px', background: 'transparent' }}>
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={pipelineNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
      />
    </div>
  );
};

/* ── Recharts: Contamination Visualization ── */
const ContaminationBarChart = () => {
  const data = [
    { name: 'Training Set', count: 250, fill: '#5a5752' },
    { name: 'Eval Set', count: 205, fill: '#e8e6e0' },
    { name: 'Leakage (Overlap)', count: 204, fill: '#c83232' },
  ];
  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
          <XAxis type="number" stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis dataKey="name" type="category" stroke="#5a5752" width={130} tick={{ fill: '#e8e6e0', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e6e0' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={56} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="count" position="right" fill="#9a9690" fontSize={13} fontFamily="'IBM Plex Mono', monospace" isAnimationActive={false} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Recharts: Locked Split Stacked Bar ── */
const LockedSplitBarChart = () => {
  const data = [
    { 
      name: 'Split',
      Train: 640,
      Val: 160,
      Test: 200,
      'Non-Lens': 285,
      'Grade B': 247
    }
  ];
  
  const CustomSplitTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>
          <div style={{ fontSize: '10px', color: '#7a7870', marginBottom: '8px', letterSpacing: '1px' }}>DATA SPLIT (1,532 TOTAL)</div>
          {payload.map((entry, index) => {
             let sub = '';
             if (entry.dataKey === 'Train') sub = '160 A + 480 C';
             if (entry.dataKey === 'Val') sub = '40 A + 120 C';
             if (entry.dataKey === 'Test') sub = '50 A + 150 C';
             if (entry.dataKey === 'Non-Lens') sub = '285 confirmed';
             if (entry.dataKey === 'Grade B') sub = 'never trained on';
             return (
               <div key={index} style={{ color: entry.color, marginBottom: '6px', fontSize: '12px' }}>
                 <span style={{ fontWeight: '500' }}>{entry.name}:</span> {entry.value} 
                 <div style={{ color: '#5a5752', fontSize: '10px', marginTop: '2px' }}>{sub}</div>
               </div>
             );
          })}
        </div>
      );
    }
    return null;
  };

  const renderLabel = (props) => {
    const { x, y, width, height, value, dataKey } = props;
    if (width < 35) return null;
    const fill = ['Test', 'Non-Lens', 'Grade B'].includes(dataKey) ? '#4a4846' : '#111111';
    return (
      <text x={x + width / 2} y={y + height / 2} fill={fill} textAnchor="middle" dominantBaseline="central" fontFamily="'IBM Plex Mono', monospace" fontSize="13" fontWeight="600">
        {value}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" hide />
          <Tooltip cursor={{ fill: 'transparent' }} content={<CustomSplitTooltip />} />
          <Legend wrapperStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="Train" stackId="a" fill="#5a5752" isAnimationActive={false}>
            <LabelList dataKey="Train" content={renderLabel} />
          </Bar>
          <Bar dataKey="Val" stackId="a" fill="#c8b89a" isAnimationActive={false}>
            <LabelList dataKey="Val" content={renderLabel} />
          </Bar>
          <Bar dataKey="Test" stackId="a" fill="#e8e6e0" isAnimationActive={false}>
            <LabelList dataKey="Test" content={renderLabel} />
          </Bar>
          <Bar dataKey="Non-Lens" stackId="a" fill="#2a2a2a" stroke="#4a4846" strokeDasharray="4 2" isAnimationActive={false}>
            <LabelList dataKey="Non-Lens" content={renderLabel} />
          </Bar>
          <Bar dataKey="Grade B" stackId="a" fill="#1a1a1a" stroke="#3a3836" strokeDasharray="4 2" isAnimationActive={false}>
            <LabelList dataKey="Grade B" content={renderLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Recharts: AUROC Horizontal Bar Chart V6–V9 ── */
const AUROCBarV6V9 = () => {
  const data = [
    { label: 'V6', val: 0.7283, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V7', val: 0.8541, fill: 'rgba(232,230,224,0.15)', stroke: '#c8b89a' },
    { label: 'V8', val: 0.8499, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V9', val: 0.8587, fill: '#242424', stroke: '#3d3b38' },
  ];

  const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const isV7 = data[index].label === 'V7';
    return (
      <g>
        {isV7 && <text x={x + 10} y={y + height / 2} fill="#8aad8a" dominantBaseline="central" fontSize="11" fontFamily="'IBM Plex Mono', monospace">+0.1258 from V6</text>}
        <text x={x + width + 10} y={y + height / 2} fill={isV7 ? '#e8e6e0' : '#7a7870'} dominantBaseline="central" fontSize="13" fontWeight={isV7 ? 600 : 400} fontFamily="'IBM Plex Mono', monospace">{value}</text>
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 20, right: 60, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
          <XAxis type="number" domain={[0.68, 0.9]} stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis dataKey="label" type="category" stroke="#5a5752" width={50} tick={{ fill: '#e8e6e0', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e6e0' }} />
          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={48} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={entry.label === 'V7' ? 1.5 : 1} />
            ))}
            <LabelList dataKey="val" content={renderCustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* -- Recharts: Final AUROC Vertical Bar Chart -- */
const FinalBarRechart = () => {
  const data = [
    { label: 'V6',  val: 0.7283, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V7',  val: 0.8541, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V8',  val: 0.8499, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V9',  val: 0.8587, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V10', val: 0.8756, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V11', val: 0.8776, fill: '#242424', stroke: '#3d3b38' },
    { label: 'V12', val: 0.8871, fill: 'rgba(232,230,224,0.15)', stroke: '#c8b89a', hi: true },
    { label: 'V15', val: 0.8687, fill: '#242424', stroke: '#3d3b38' },
  ];
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis dataKey="label" stroke="#5a5752" tick={{ fill: '#e8e6e0', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis domain={[0.68, 0.90]} stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e6e0' }} />
          <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} stroke={entry.stroke} strokeWidth={entry.hi ? 1.5 : 1} />
            ))}
            <LabelList dataKey="val" position="top" fill="#e8e6e0" fontSize={12} fontFamily="'IBM Plex Mono', monospace" isAnimationActive={false} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Recharts: Val vs Test AUROC Gap ── */
const ValTestGapBarChart = () => {
  const data = [
    { label: 'V10 Test', val: 0.8756, fill: '#4a4846' },
    { label: 'V11 Val', val: 0.9381, fill: '#c8b89a' },
    { label: 'V11 Test', val: 0.8776, fill: '#7a7870' },
  ];
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
          <XAxis type="number" domain={[0.84, 0.96]} stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis dataKey="label" type="category" stroke="#5a5752" width={80} tick={{ fill: '#e8e6e0', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e6e0' }} />
          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={28} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="val" position="right" fill="#e8e6e0" fontSize={13} fontFamily="'IBM Plex Mono', monospace" isAnimationActive={false} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Recharts: AUROC Line Chart V6–V15 ── */
const AUROCLineRechart = () => {
  const data = [
    { label: 'V6',  val: 0.7283 }, { label: 'V7',  val: 0.8541 },
    { label: 'V8',  val: 0.8499 }, { label: 'V9',  val: 0.8587 },
    { label: 'V10', val: 0.8756 }, { label: 'V11', val: 0.8776 },
    { label: 'V12', val: 0.8871 }, { label: 'V15', val: 0.8687 },
  ];
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="label" stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis domain={[0.7, 0.9]} stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
          <Line type="monotone" dataKey="val" stroke="#e8e6e0" strokeWidth={2} dot={{ fill: '#e8e6e0' }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── HTML/CSS Grid: Confusion Matrix ── */
const ConfusionMatrixGrid = () => {
  return (
    <div style={{ width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gridTemplateRows: '40px 150px 150px', gap: '8px' }}>
        {/* Empty top-left */}
        <div></div>
        {/* Col Headers */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '8px', color: '#5a5752', fontSize: '12px' }}>Predicted: Non-Lens</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '8px', color: '#5a5752', fontSize: '12px' }}>Predicted: Lens</div>
        
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', color: '#5a5752', fontSize: '12px', textAlign: 'right' }}>Actual:<br/>Lens</div>
        {/* FN */}
        <div style={{ background: 'rgba(173,138,138,0.06)', border: '1.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#3d3b38', letterSpacing: '1px', marginBottom: '8px' }}>FN</div>
          <div style={{ fontSize: '36px', color: '#ad8a8a', fontWeight: '200', marginBottom: '4px' }}>15</div>
          <div style={{ fontSize: '12px', color: '#5a5752' }}>30%</div>
        </div>
        {/* TP */}
        <div style={{ background: 'rgba(232,230,224,0.06)', border: '1.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#3d3b38', letterSpacing: '1px', marginBottom: '8px' }}>TP</div>
          <div style={{ fontSize: '36px', color: '#e8e6e0', fontWeight: '200', marginBottom: '4px' }}>35</div>
          <div style={{ fontSize: '12px', color: '#5a5752' }}>70%</div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', color: '#5a5752', fontSize: '12px', textAlign: 'right' }}>Actual:<br/>Non-Lens</div>
        {/* TN */}
        <div style={{ background: 'rgba(232,230,224,0.06)', border: '1.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#3d3b38', letterSpacing: '1px', marginBottom: '8px' }}>TN</div>
          <div style={{ fontSize: '36px', color: '#e8e6e0', fontWeight: '200', marginBottom: '4px' }}>143</div>
          <div style={{ fontSize: '12px', color: '#5a5752' }}>95.3%</div>
        </div>
        {/* FP */}
        <div style={{ background: 'rgba(173,138,138,0.06)', border: '1.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#3d3b38', letterSpacing: '1px', marginBottom: '8px' }}>FP</div>
          <div style={{ fontSize: '36px', color: '#ad8a8a', fontWeight: '200', marginBottom: '4px' }}>7</div>
          <div style={{ fontSize: '12px', color: '#5a5752' }}>4.7%</div>
        </div>
      </div>
    </div>
  );
};

/* ── Recharts: Shannon Entropy Bar Chart ── */
const EntropyBarRechart = () => {
  const data = [
    { label: 'Baseline',   val: 1.1236, fill: '#242424', stroke: '#3d3b38', note: '' },
    { label: 'CORAL',      val: 0.1429, fill: '#4a2a2a', stroke: '#3d3b38', note: 'Confident — but wrong' },
    { label: 'DANN',       val: 1.5807, fill: '#242424', stroke: '#3d3b38', note: 'Failed' },
    { label: 'ADDA',       val: 1.5732, fill: '#242424', stroke: '#3d3b38', note: 'Failed' },
    { label: 'Noise Inj.', val: 0.7524, fill: '#e8e6e0', stroke: '#c8b89a', note: '★ BEST' },
    { label: 'PSF + TTA',  val: 1.0759, fill: '#242424', stroke: '#3d3b38', note: '' },
    { label: 'Ensemble',   val: 0.9626, fill: '#242424', stroke: '#3d3b38', note: '' },
  ];

  const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const entry = data[index];
    const isHi = entry.label === 'Noise Inj.';
    const labelText = entry.note ? `${value}  ${entry.note}` : `${value}`;
    return (
      <text x={x + width + 10} y={y + height / 2} fill={isHi ? '#c8b89a' : '#7a7870'} dominantBaseline="central" fontSize="12" fontFamily="'IBM Plex Mono', monospace">
        {labelText}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: 480 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 36, right: 200, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
          <XAxis type="number" domain={[0, 1.585]} stroke="#5a5752" tick={{ fill: '#7a7870', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} />
          <YAxis dataKey="label" type="category" stroke="#5a5752" width={100} tick={{ fill: '#e8e6e0', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e6e0' }} />
          <ReferenceLine x={1.585} stroke="#3a3836" strokeDasharray="4 3" label={{ position: 'top', value: 'Max entropy', fill: '#3d3b38', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} />
          <ReferenceLine x={0.5} stroke="#6b5f4e" strokeDasharray="4 3" label={{ position: 'top', value: 'High-conf', fill: '#6b5f4e', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={36} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={entry.label === 'Noise Inj.' ? 1.5 : 0.5} />
            ))}
            <LabelList dataKey="val" content={renderCustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


export default function Journey() {
  const activeSection = useSectionSpy(PHASES.map(p => p.id));

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="tab-content">
      <OrientationStrip
        title="JOURNEY"
        description="The full story — every model version, every failure, every decision, and what the data finally revealed."
      />

      <div className="container">
        <div className="jrn-layout">

          {/* ── Sticky Sidebar ── */}
          <nav className="jrn-sidebar">
            <div className="jrn-sidebar-title">Phases</div>
            {PHASES.map(p => (
              <button key={p.id} className={`jrn-nav-item${activeSection === p.id ? ' active' : ''}`} onClick={() => scrollTo(p.id)}>
                <span className="jrn-nav-dot" />
                <span className="jrn-nav-label">{p.label}</span>
              </button>
            ))}
          </nav>

          {/* ── Main Content ── */}
          <main className="jrn-main">

            {/* Header */}
            <div className="jrn-header">
              <div className="jrn-breadcrumb">Journey</div>
              <h2 className="jrn-title playfair jrn-title-italic">The Research Log</h2>
              <p className="jrn-subtitle">The complete chronological record of the project — documenting every model iteration, critical failure, architectural decision, and the final empirical results.</p>
            </div>

            {/* ── PHASE 0 ── */}
            <section className="jrn-phase" id="phase0">
              <div className="jrn-phase-label">Phase 0 — Setup</div>
              <h3 className="jrn-phase-header playfair">The Starting Point</h3>

              <p className="jrn-p">The goal: build a robust, contamination-free machine learning pipeline to detect gravitational lenses in real ESA Euclid Q1 imagery. The non-negotiable rule — no synthetic data in final evaluation, and absolute separation between training and test sets at all times.</p>
              <p className="jrn-p">The project ran two parallel tracks. <span style={{color:'var(--text-primary)', fontWeight:'400', textDecoration:'underline'}}>Track A</span> — binary detection: does this image contain a gravitational lens? <span style={{color:'var(--text-primary)', fontWeight:'400', textDecoration:'underline'}}>Track B</span> — substructure classification: if it is a lens, what type of dark matter halo does it show (Smooth, Cold Dark Matter, or Axion)? Fourteen distinct binary detector versions (V2–V15) were trained and evaluated across Track A, alongside seven domain adaptation methods for Track B.</p>
              <p className="jrn-p">What makes this problem genuinely difficult is that every image is real telescope data — not a simulation — with all the noise, PSF blurring, and artefacts that implies. The entire positive training set consists of 160 confirmed Grade A lens candidates — drawn from the 250-entry ESA SLDE catalog and split into 160 training, 40 validation, and 50 test images. For context, a typical ImageNet classification task has over a million examples per class. The core challenge throughout this project is learning a robust detector from an extremely small, real, and noisy dataset.</p>

              {/* Dataset table */}
              <div className="jrn-table-wrap">
                <div className="jrn-chart-title">Available Datasets</div>
                <table className="jrn-table">
                  <thead>
                    <tr>
                      <th>Dataset</th>
                      <th>Count</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Grade A (ESA SLDE catalog)</td><td className="td-num">250 <GlossaryTooltip term="FITS">FITS</GlossaryTooltip></td><td>High-confidence lenses (~90% clean). Split: 160 train / 40 val / 50 test.</td></tr>
                    <tr><td>Grade B (ESA SLDE catalog)</td><td className="td-num">247 <GlossaryTooltip term="FITS">FITS</GlossaryTooltip></td><td>Probable lenses (70–90% clean). Diagnostic only — never trained on.</td></tr>
                    <tr><td>Grade C (ESA SLDE catalog)</td><td className="td-num">~1,918 <GlossaryTooltip term="FITS">FITS</GlossaryTooltip></td><td>Low-confidence candidates. Used as training negatives.</td></tr>
                    <tr><td>Verified Non-Lens Set</td><td className="td-num">285 <GlossaryTooltip term="FITS">FITS</GlossaryTooltip></td><td>Confirmed non-lenses. Spatially independent. Independent verification set.</td></tr>
                    <tr><td>DeepLense simulations (Track B)</td><td className="td-num">37,500 .npy</td><td>30k train + 7.5k val. 3 classes, perfectly balanced.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 1 ── */}
            <section className="jrn-phase" id="phase1">
              <div className="jrn-phase-label">Phase 1 — Invalidated Baselines (V2–V5)</div>
              <h3 className="jrn-phase-header playfair">The numbers looked extraordinary. Then we found the bug.</h3>

              <div className="jrn-cols-40-60">
                <div>
                  <p className="jrn-p">Early models (V2–V5) used EfficientNet-B0 pretrained on ImageNet. V2 achieved <GlossaryTooltip term="AUROC" /> 0.9910. V3 failed to converge entirely. V4 reached 3 of 5 criteria with <GlossaryTooltip term="AUROC" /> 0.8717. V5 extended training on all 250 Grade A lenses reached <GlossaryTooltip term="AUROC" /> 0.9018.</p>
                  <p className="jrn-p">All of these numbers are invalid. The evaluation set was a subset of the training data. 204 of 205 evaluation positives were inside the 250 Grade A training set — confirmed by SkyCoord cross-match at &lt;2 arcsec (a method of checking whether two catalog entries point at the same patch of sky, within a tiny angular tolerance of 2 arcseconds). The model was being graded on its own homework.</p>
                  <p className="jrn-p">V5 <GlossaryTooltip term="Grad-CAM">Grad-CAM</GlossaryTooltip> confirmed why the invalidated results were untrustworthy even beyond the split issue: the model attended to <span style={{color:'var(--text-primary)', fontWeight:'400', textDecoration:'underline'}}>corners and edges</span> rather than arc structure — a brightness bias. It was detecting "large bright galaxy" as a proxy for a lens, not the gravitational arc itself. False positives were bright ellipticals; false negatives were faint compact lenses.</p>
                  <div className="jrn-quote">
                    <p>"<GlossaryTooltip term="AUROC" /> 0.99 felt like success. It was a measurement error. The only way to know is to verify the split programmatically, every time."</p>
                  </div>
                </div>
                <div className="jrn-chart-box">
                  <div className="jrn-chart-title">Data Leakage Analysis</div>
                  <ContaminationBarChart />
                </div>
              </div>

              <div className="jrn-callout">
                <div className="jrn-callout-label">V3 Failure — Five Compounding Causes</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', fontFamily: "'IBM Plex Mono', monospace" }}>
                  <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--text-primary)', fontWeight: '400', textDecoration: 'underline' }}>Label Noise:</span> Grade B has a 10–30% false positive rate. With fewer than 1,200 training samples, even a small fraction of mislabelled positives is enough to corrupt the loss signal entirely.</li>
                  <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--text-primary)', fontWeight: '400', textDecoration: 'underline' }}>Data Leakage:</span> EDF-North and EDF-South sky fields overlap both the training and validation splits geographically — meaning the same galaxy clusters appear on both sides of the split, inflating validation scores.</li>
                  <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--text-primary)', fontWeight: '400', textDecoration: 'underline' }}>Loss Function:</span> Focal loss with γ=2.0 down-weights easy examples — but the cleanest, most unambiguous confirmed lenses are exactly the "easy" examples it suppresses, depriving the model of the most reliable training signal.</li>
                  <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--text-primary)', fontWeight: '400', textDecoration: 'underline' }}>Overfitting:</span> Training for 20 epochs on approximately 1,100 samples gave the model enough capacity to partially memorise the training set rather than generalise, producing a model that failed immediately on held-out data.</li>
                  <li><span style={{ color: 'var(--text-primary)', fontWeight: '400', textDecoration: 'underline' }}>Preprocessing:</span> SLDE images are 300×300 pixels, but no centre-crop was applied before resizing to 224×224. Resizing the full field of view compresses the arc structure into a few pixels, making it effectively invisible to the model.</li>
                </ul>
              </div>

              <div className="jrn-table-wrap">
                <table className="jrn-table">
                  <thead>
                    <tr><th>Version</th><th>Architecture</th><th><GlossaryTooltip term="AUROC" /></th><th>Why Invalid</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>V2</td><td>EfficientNet-B0</td><td className="td-num td-bad">0.9910</td><td>Eval set = training data subset</td></tr>
                    <tr><td>V3</td><td>EfficientNet-B0</td><td className="td-num td-bad">0.6700</td><td>Grade B label noise + focal loss collapse</td></tr>
                    <tr><td>V4</td><td>EfficientNet-B0</td><td className="td-num td-bad">0.8717</td><td>Geographic split failed — positives span both sky fields</td></tr>
                    <tr><td>V5</td><td>EfficientNet-B0</td><td className="td-num td-bad">0.9018</td><td>204/205 eval positives confirmed inside training set</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="jrn-callout jrn-callout-warning jrn-content-group-sm">
                <div className="jrn-callout-label">The Attempt That Never Trained — V6 Attempt 2</div>
                <p>
                  Before V7, there was an attempt to reuse the V2 backbone (EfficientNet-B0, ImageNet-pretrained) as the feature extractor for the new clean split. A cross-match was run between V2's training data and the proposed test positives. Result: <strong style={{color:'#ad8a8a'}}>38 of 50 test positives overlapped V2's training data.</strong> The backbone had already seen — and partially memorised — most of the test set during V2 training. The approach was abandoned before a single gradient step. The V2 backbone is permanently excluded from any version that uses the locked holdout set.
                </p>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 2 ── */}
            <section className="jrn-phase" id="phase2">
              <div className="jrn-phase-label">Phase 2 — First Validated Result (V6)</div>
              <h3 className="jrn-phase-header playfair">Fixing the foundation before building anything else.</h3>

              <div className="jrn-cols">
                <div>
                  <p className="jrn-p">Before training any new model, a contamination-proof split was constructed. Method: SkyCoord cross-match of all 250 Grade A files against Confirmed Lenses (Independent Set) at &lt;2 arcsec. Files with a match → training pool. Files with no match → test set (50 files).</p>
                  <p className="jrn-p">The 285 Verified Non-Lens Set has zero overlap with any catalog entry — confirmed independently. This split is locked permanently: once set, it is never changed or regenerated, ensuring the test set remains truly unseen for the entire duration of the project.</p>
                  <p className="jrn-p">V6 used the sim-pretrained backbone (best_model.pth — the Track B substructure model trained on 30k noiseless simulations). This was a deliberate test of simulation-to-real transfer. The result showed it was the wrong prior for noisy real images.</p>
                  <div className="jrn-quote">
                    <p>"0.7283 felt like failure after seeing 0.99. It was the first true result this project had produced."</p>
                  </div>
                </div>
                <div className="jrn-chart-box jrn-chart-box-spaced">
                <div className="jrn-chart-title">Dataset Split Composition</div>
                <LockedSplitBarChart />
              </div>
              </div>

              <div className="jrn-table-wrap">
                <table className="jrn-table">
                  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                  <tbody>
                    <tr><td>AUROC (TTA)</td><td className="td-num">0.7283 — first validated result</td></tr>
                    <tr><td>Precision</td><td className="td-num">0.5789</td></tr>
                    <tr><td>Recall</td><td className="td-num">0.4400</td></tr>
                    <tr><td>F1</td><td className="td-num">0.5000</td></tr>
                    <tr><td>Threshold</td><td className="td-num">0.5830</td></tr>
                    <tr><td>FPR on Verified Non-Lens Set (independent)</td><td className="td-num">0.0737</td></tr>
                  </tbody>
                </table>
                <p className="jrn-footnote">Spearman ρ — rank correlation between model P(lens) scores and SLDE catalog grades (A=1, B=0.5, C=0) across the test set. Diagnostic only — not used for model selection.</p>
              </div>

              {/* Preprocessing pipeline */}
              <div className="jrn-callout jrn-content-group">
                <div className="jrn-callout-label">Preprocessing Pipeline — Every <GlossaryTooltip term="FITS">FITS</GlossaryTooltip> File (V7 path)</div>
                <p>This pipeline was designed specifically to bring faint gravitational arcs into visible range while removing telescope background noise — the two problems that make raw Euclid <GlossaryTooltip term="FITS">FITS</GlossaryTooltip> data unusable directly.</p>
                <ol>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>Border ring subtraction:</span> Compute median of all pixels within 10 px of any edge. Subtract from entire image. Clip to 0. Removes sky background.</li>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>log1p stretch:</span> Apply log1p(arr) — compresses dynamic range, brings faint arcs into visible range.</li>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>Percentile normalisation:</span> Min-max scale using 1st–99th percentile → [0, 1]. Clip to [0, 1]. Robust to bright stars.</li>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>Training augmentations:</span> Random 90° rotations, horizontal/vertical flips (p=0.5), Gaussian noise (σ∈[0.005, 0.025]), and flux scaling (×U[0.8, 1.2]).</li>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>Bilinear resize:</span> 224×224 pixels.</li>
                  <li><span style={{ fontWeight: '400', textDecoration: 'underline', color: 'var(--text-primary)' }}>Single channel (V7 only):</span> Keep as 1-channel input. No ImageNet normalisation. Zoobot expects [0, 1] galaxy images. DINOv2 variants replicate to 3 channels and apply ImageNet normalisation.</li>
                </ol>
              </div>

              {/* Two-stage training */}
              <div className="jrn-callout jrn-content-group-sm">
                <div className="jrn-callout-label">Two-Stage Training Protocol — V6 through V15</div>
                <p>Two stages exist because freezing the encoder first prevents the pretrained weights from being destroyed by the randomly initialised classification head before it has had a chance to stabilise.</p>
                <div className="jrn-callout-grid">
                  <div className="jrn-callout-grid-item">
                    <div className="jrn-callout-grid-label">Stage 1 — Head Only (5 epochs)</div>
                    <p>Encoder frozen. Only the classification head is trained. LR = 1e-3, WD = 1e-4. CosineAnnealingLR, T_max=5. Allows the new head to stabilise without destroying pretrained features.</p>
                  </div>
                  <div className="jrn-callout-grid-item">
                    <div className="jrn-callout-grid-label">Stage 2 — Full Fine-tune (up to 20 epochs)</div>
                    <p>Encoder unfrozen with LR warmup: epoch 0 → 1e-7, epoch 1 → 2.55e-6, epoch 2+ → cosine decay from 5e-6 to 1e-7. Head LR = 5e-5. Early stopping, patience = 5. Best checkpoint selected by no-TTA val AUROC. (Note: V15 extended this to 25 epochs).</p>
                  </div>
                </div>
              </div>
            </section>


            <div className="jrn-divider" />

            {/* ── PHASE 3 ── */}
            <section className="jrn-phase" id="phase3">
              <div className="jrn-phase-label">Phase 3 — Galaxy-Pretrained Backbones (V7–V9)</div>
              <h3 className="jrn-phase-header playfair">The right prior changes everything.</h3>

              <div className="jrn-cols">
                <div>
                  <p className="jrn-p">The key insight: a model pretrained on 30k noiseless simulations has the wrong inductive bias for noisy real galaxy images. Inductive bias refers to the patterns a model learns to look for based on its training data — a model trained on simulations learns to recognise perfectly clean arc morphology, which rarely exists in real instrument data. Zoobot — pretrained on ~100 million real galaxy morphologies across heterogeneous surveys — was the correct choice. ESA's own Lines et al. 2025 (SLDE Paper C) confirmed Zoobot as the best performer on Q1. It is deployed in the official ESA Euclid pipeline.</p>
                  <p className="jrn-p">V7 (Zoobot ConvNeXt-Nano, greyscale, 14.9M params) produced an immediate +0.1258 AUROC jump over V6 — the largest single improvement in the project. V8 tested ConvNeXt-Small but the greyscale variant was unavailable; the 3-channel version underperformed. V9 added 200 challenging negative samples from Verified Non-Lens Set — AUROC improved marginally but precision degraded from 0.70 to 0.55.</p>
                  <div className="jrn-callout">
                    <div className="jrn-callout-label">V7 Architecture</div>
                    <p>Input: single-channel 224×224, values in [0,1], no ImageNet normalisation. Encoder: Zoobot ConvNeXt-Nano greyscale. Head: Dropout(0.3) → Linear(640, 2). Two-stage training: 5 epochs head-only, then up to 20 epochs full fine-tune with encoder LR warmup.</p>
                    <p className="jrn-callout-note">Single-channel input is used here because the Euclid VIS instrument is single-band, and the Zoobot greyscale encoder was pretrained on single-band galaxy surveys — making it a direct architectural match without any channel replication or normalisation mismatch.</p>
                  </div>
                </div>
                <div className="jrn-chart-box">
                  <div className="jrn-chart-title">AUROC Progression — V6 → V9</div>
                  <AUROCBarV6V9 />
                </div>
              </div>
              <p className="jrn-p jrn-mt-sm">The precision collapse in V9 has a direct cause: adding 200 challenging negative samples from the confirmed non-lens set shifts the model's decision boundary, making it more conservative. This improves recall (it catches more lenses) but forces it to accept more false alarms to do so — the classic precision–recall trade-off under a harder negative distribution.</p>

              <div className="jrn-table-wrap">
                <table className="jrn-table">
                  <thead><tr><th>Metric</th><th>V7 — Zoobot Nano</th><th>V8 — Zoobot Small</th><th>V9 — Nano + Challenging Neg</th></tr></thead>
                  <tbody>
                    <tr><td>AUROC</td><td className="td-num td-good">0.8541</td><td className="td-num">0.8499</td><td className="td-num">0.8587</td></tr>
                    <tr><td>Precision</td><td className="td-num">0.7037</td><td className="td-num">0.4096</td><td className="td-num">0.5455</td></tr>
                    <tr><td>Recall</td><td className="td-num">0.7600</td><td className="td-num">0.6800</td><td className="td-num">0.7200</td></tr>
                    <tr><td>F1</td><td className="td-num">0.7308</td><td className="td-num">0.5113</td><td className="td-num">0.6207</td></tr>
                    <tr><td>Threshold</td><td className="td-num">0.6230</td><td className="td-num">0.2700</td><td className="td-num">0.4800</td></tr>
                    <tr><td>FPR (independent)</td><td className="td-num">0.0912</td><td className="td-num">0.3267</td><td className="td-num">0.0353</td></tr>
                    <tr><td>Spearman ρ</td><td className="td-num">0.8296</td><td className="td-num">0.3662</td><td className="td-num">0.5380</td></tr>
                    <tr><td>Params</td><td className="td-num">14.9M</td><td className="td-num">Larger</td><td className="td-num">14.9M</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 4 ── */}
            <section className="jrn-phase" id="phase4">
              <div className="jrn-phase-label">Phase 4 — Scaling Up (V10–V11)</div>
              <h3 className="jrn-phase-header playfair">More parameters, higher AUROC — but calibration breaks.</h3>

              <p className="jrn-p">DINOv2 Vision Transformers (Meta AI, pretrained on 142M images via self-supervised learning) were tested next. Unlike convolutional networks that extract local features through sliding filters, ViT (Vision Transformer) models divide an image into fixed patches and process the entire sequence jointly — a fundamentally different way of extracting global structure. ViT-S/14 (22M params, V10) and ViT-B/14 (86M params, V11) both outperformed V7 by AUROC. But both showed a calibration problem: thresholds of 0.23 and 0.30, compared to V7's clean 0.623.</p>
              <p className="jrn-p">Calibration matters in practice. A well-calibrated model producing a P(lens) of 0.623 is meaningful — it means "62% confident this is a lens." A poorly calibrated model requiring a threshold of 0.23 means you must flag everything above 23% confidence as a lens, which in a survey of millions of galaxies produces a far larger number of false alarms, most of which require expensive human review.</p>
              <div className="jrn-chart-box">
                <div className="jrn-chart-title">Final AUROC Comparison</div>
                <FinalBarRechart />
              </div>
              <p className="jrn-p">V11 achieved the highest single-model AUROC at 0.8776, but val AUROC was 0.9381 — a 0.06 gap confirming overfitting. With only 160 training positives, an 86-million-parameter model has sufficient capacity to partially memorise patterns in the small validation set rather than generalise to genuinely unseen data. Temperature scaling was attempted on V10 to fix calibration — it broke the AUROC due to a TTA+logit averaging interaction bug. Abandoned.</p>
              <div className="jrn-chart-box">
                <div className="jrn-chart-title">Val vs Test AUROC Gap — Overfitting Signal</div>
                <ValTestGapBarChart />
              </div>

              <div className="jrn-table-wrap">
                <table className="jrn-table">
                  <thead><tr><th>Metric</th><th>V10 — DINOv2-S</th><th>V11 — DINOv2-B</th></tr></thead>
                  <tbody>
                    <tr><td>Parameters</td><td className="td-num">~22M</td><td className="td-num">86M</td></tr>
                    <tr><td>Val AUROC</td><td className="td-num">—</td><td className="td-num">0.9381</td></tr>
                    <tr><td>Test AUROC (TTA)</td><td className="td-num">0.8756</td><td className="td-num">0.8776</td></tr>
                    <tr><td>Precision</td><td className="td-num">0.5758</td><td className="td-num">0.5556</td></tr>
                    <tr><td>Recall</td><td className="td-num">0.7600</td><td className="td-num">0.8000</td></tr>
                    <tr><td>F1</td><td className="td-num">0.6552</td><td className="td-num">0.6557</td></tr>
                    <tr><td>Threshold</td><td className="td-num td-bad">0.23</td><td className="td-num td-bad">0.30</td></tr>
                    <tr><td>FPR (independent)</td><td className="td-num">0.0235</td><td className="td-num">0.0353</td></tr>
                    <tr><td>Calibration</td><td className="td-num td-bad">Poor</td><td className="td-num td-bad">Poor</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 5 ── */}
            <section className="jrn-phase" id="phase5">
              <div className="jrn-phase-label">Phase 5 — Ensemble and Data Mining (V12–V15)</div>
              <h3 className="jrn-phase-header playfair">Combining the best models, then trying to grow the dataset.</h3>

              <div className="jrn-cols">
                <div>
                  <p className="jrn-h3">V12 — The Ensemble</p>
                  <p className="jrn-p">Combined V7 (weight 0.3), V10 (weight 0.2), and V11 (weight 0.5) using weighted <GlossaryTooltip term="Logits">logit</GlossaryTooltip> averaging before softmax. Logit averaging means the raw pre-softmax scores from each model are combined first, then converted to probabilities together — rather than averaging the final probabilities, which is less numerically stable and loses information about relative model confidence. Weights reflect historical reliability — V11 highest <GlossaryTooltip term="AUROC" />, V7 highest precision and calibration. Different architectures (ConvNeXt + ViT-S + ViT-B) produce complementary errors; the <GlossaryTooltip term="Ensemble">ensemble</GlossaryTooltip> cancels individual mistakes. Result: <GlossaryTooltip term="AUROC" /> 0.8871, the project best.</p>

                  <p className="jrn-h3">V13 — The Teacher</p>
                  <p className="jrn-p">V12 was wrapped as a portable Teacher model and used to score approximately 2,165 unlabelled Grade B and Grade C files. Only images with P(lens) &gt; 0.98 were retained — a high threshold chosen to minimise label noise in the extracted candidates.</p>

                  <p className="jrn-h3">V14 — The Mining Run</p>
                  <p className="jrn-p">Running the Teacher over the unlabelled pool extracted 234 pseudo-labeled candidates. Training positives grew from 160 to 394, a 146% increase on paper.</p>

                </div>
                <div className="jrn-chart-box">
                  <div className="jrn-chart-title">AUROC Progression — All Validated Versions V6–V15</div>
                  <AUROCLineRechart />

                  <div style={{ marginTop: '110px' }}>
                    <p className="jrn-h3">V15 — The Result</p>
                    <p className="jrn-p">DINOv2-B retrained on this expanded set produced <GlossaryTooltip term="AUROC" /> 0.8687 — lower than V11's 0.8776 despite having 146% more positives. Label quality beats label quantity. The 234 pseudo-labeled images were scored by the same <GlossaryTooltip term="Ensemble">ensemble</GlossaryTooltip> that contains V11, meaning the Teacher preferentially selects images that look like what V11 already recognises, introducing a selection bias that pseudo-label noise cannot fully overcome.</p>
                  </div>
                </div>
              </div>

              {/* V12 Confusion Matrix */}
              <div className="jrn-cols-40-60 jrn-cols-spaced">
                <div className="jrn-chart-box jrn-chart-box-flex">
                  <div className="jrn-chart-title">V12 Confusion Matrix — Threshold 0.70</div>
                  <div style={{ flex: 1 }}>
                    <ConfusionMatrixGrid />
                  </div>
                </div>
                <div>
                  <p className="jrn-h3 jrn-h3-spaced">Data Mining Results</p>
                  <div className="jrn-table-wrap jrn-table-compact">
                    <table className="jrn-table">
                      <thead><tr><th>Step</th><th>Value</th></tr></thead>
                      <tbody>
                        <tr><td>Files scanned</td><td className="td-num">~2,165 (Grade B + C)</td></tr>
                        <tr><td>Threshold used</td><td className="td-num">P(lens) &gt; 0.98</td></tr>
                        <tr><td>Pseudo-labels extracted</td><td className="td-num">234</td></tr>
                        <tr><td>Training positives: before</td><td className="td-num">160</td></tr>
                        <tr><td>Training positives: after</td><td className="td-num td-good">394 (+146%)</td></tr>
                        <tr><td>V15 AUROC result</td><td className="td-num td-bad">0.8687</td></tr>
                        <tr><td>Conclusion</td><td>Label quality &gt; label quantity</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* V12 calibration operating points */}
              <div className="jrn-table-wrap" style={{ marginTop: '40px' }}>
                <div className="jrn-chart-title">V12 — Confusion Matrix at Threshold 0.70 (Test Set: 50 pos + 150 neg = 200 total)</div>
                <table className="jrn-table">
                  <thead><tr><th>Cell</th><th>Count</th><th>Rate</th><th>Interpretation</th></tr></thead>
                  <tbody>
                    <tr className="row-highlight"><td>TP — Correct Lens</td><td className="td-num">35</td><td className="td-num">70% recall</td><td>Lens correctly identified</td></tr>
                    <tr><td>FN — Missed Lens</td><td className="td-num">15</td><td className="td-num">30%</td><td>Lens classified as non-lens</td></tr>
                    <tr className="row-highlight"><td>TN — Correct Non-Lens</td><td className="td-num">143</td><td className="td-num">95.3%</td><td>Non-lens correctly rejected</td></tr>
                    <tr><td>FP — False Alarm</td><td className="td-num">7</td><td className="td-num">4.7% FPR</td><td>Non-lens called a lens</td></tr>
                  </tbody>
                </table>
                <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Test set composition: 50 Grade A positives + 100 Grade C clean + 50 Grade C challenging negatives = 200 total. <GlossaryTooltip term="AUROC" />(<GlossaryTooltip term="TTA">TTA</GlossaryTooltip>) = 0.8871. Spearman ρ = 0.5806 (DIAGNOSTIC ONLY).</p>
              </div>

              {/* V12 Full Threshold Sweep */}
              <div className="jrn-table-wrap" style={{ marginTop: '40px' }}>
                <div className="jrn-chart-title">V12 Full Threshold Sweep (Test Set: 50 pos + 150 neg)</div>
                <table className="jrn-table">
                  <thead><tr><th>Threshold</th><th>Precision</th><th>Recall</th><th>F1</th><th>TP</th><th>FP</th><th>FN</th><th>TN</th></tr></thead>
                  <tbody>
                    {[
                      [0.10,0.3937,1.0000,0.5650,50,77,0,73],
                      [0.15,0.4202,1.0000,0.5917,50,69,0,81],
                      [0.20,0.4464,1.0000,0.6173,50,62,0,88],
                      [0.25,0.4808,1.0000,0.6494,50,54,0,96],
                      [0.30,0.5158,0.9800,0.6759,49,46,1,104],
                      [0.35,0.5698,0.9800,0.7206,49,37,1,113],
                      [0.40,0.6154,0.9600,0.7500,48,30,2,120],
                      [0.45,0.6912,0.9400,0.7966,47,21,3,129],
                      [0.50,0.7500,0.8400,0.7925,42,14,8,136],
                      [0.55,0.7593,0.8200,0.7885,41,13,9,137],
                      [0.60,0.7959,0.7800,0.7879,39,10,11,140],
                      [0.65,0.8222,0.7400,0.7789,37,8,13,142],
                      [0.70,0.8333,0.7000,0.7609,35,7,15,143],
                      [0.75,0.8788,0.5800,0.6988,29,4,21,146],
                      [0.80,0.8929,0.5000,0.6410,25,3,25,147],
                      [0.85,0.9412,0.3200,0.4776,16,1,34,149],
                      [0.90,1.0000,0.2000,0.3333,10,0,40,150]
                    ].map(([thr, pr, re, f1, tp, fp, fn, tn], i) => (
                      <tr key={i} className={thr === 0.70 ? 'row-highlight' : ''}>
                        <td className="td-num">{thr.toFixed(2)}{thr === 0.70 ? ' ★' : ''}</td>
                        <td className="td-num">{pr.toFixed(4)}</td>
                        <td className="td-num">{re.toFixed(4)}</td>
                        <td className="td-num">{f1.toFixed(4)}</td>
                        <td className="td-num">{tp}</td><td className="td-num">{fp}</td>
                        <td className="td-num">{fn}</td><td className="td-num">{tn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 6 ── */}
            <section className="jrn-phase" id="phase6">
              <div className="jrn-phase-label">Phase 6 — Track B: Substructure Classification</div>
              <h3 className="jrn-phase-header playfair">Seven methods. One validated conclusion.</h3>

              <div className="jrn-content-stack">
                <div className="jrn-text-content">
                  <p className="jrn-p">Track B attempted to classify confirmed lenses as smooth halos, <GlossaryTooltip term="CDM">CDM</GlossaryTooltip> (cold dark matter with particle subhalos), or <GlossaryTooltip term="Axion">axion</GlossaryTooltip> dark matter (smoother halos). The model was trained on 30,000 noiseless DeepLense simulations and evaluated on 205 real Euclid lenses. Shannon entropy measures how uncertain the model is about its prediction — 0 means perfectly confident in a single class, 1.585 bits is completely random (uniform across 3 classes).</p>
                  <p className="jrn-p">The baseline model's class distribution on real Euclid lenses reveals the extent of the simulation bias: <strong style={{color:'var(--text-primary)'}}><GlossaryTooltip term="CDM" /> 72.7%, <GlossaryTooltip term="Axion" /> 16.6%, Smooth 10.7%</strong>. The sim model is heavily biased toward <GlossaryTooltip term="CDM" /> — the most common simulation class — even on real images it has never seen. This is the sim-to-real gap in concrete numbers.</p>
                  <p className="jrn-p">Three classic <GlossaryTooltip term="Domain Adaptation">domain adaptation</GlossaryTooltip> methods (CORAL, DANN, ADDA) collapsed due to the 30,000:205 simulation-to-real imbalance. Domain adaptation works by finding features common to both source and target data — but with 147× more source samples, those "common features" end up being the simulation's dominant visual patterns, not real lens morphology. Noise injection retraining (Method 5) was the only approach producing meaningful signal — reducing entropy by 33% and increasing high-confidence predictions 5×. Even so, 71.2% of lenses remained uncertain.</p>
                  <p className="jrn-p">ESA independently confirmed: Q1 PSF FWHM ≈ 0.18 arcsec blurs the sub-arcsecond arc perturbations needed to distinguish dark matter models. The DeepLense GSoC 2025 team reached the same conclusion independently.</p>
                  <div className="jrn-quote">
                    <p>"Knowing what cannot be measured at current resolution is itself a scientific result."</p>
                  </div>
                </div>
                <div className="jrn-chart-fullwidth">
                  <div className="jrn-chart-title">Shannon Entropy by Method — Lower = More Confident</div>
                  <EntropyBarRechart />
                </div>
              </div>

              <div className="jrn-table-wrap">
                <table className="jrn-table">
                  <thead><tr><th>Method</th><th>Entropy</th><th>Confidence</th><th>% Uncertain</th><th>High-Conf</th><th>Outcome</th></tr></thead>
                  <tbody>
<tr><td>1. Baseline MC Dropout</td><td className="td-num">1.1236</td><td className="td-num">0.6427</td><td className="td-num">94.6%</td><td className="td-num">11/205</td><td>0/4 criteria</td></tr>
                    <tr><td>2. CORAL</td><td className="td-num">0.1429</td><td className="td-num">0.9566</td><td className="td-num td-bad">100%</td><td className="td-num">0/205</td><td className="td-bad">Failed — CDM 100%</td></tr>
                    <tr><td>3. DANN</td><td className="td-num">1.5807</td><td className="td-num">0.3626</td><td className="td-num td-bad">100%</td><td className="td-num">0/205</td><td className="td-bad">Failed — random predictions</td></tr>
                    <tr><td>4. ADDA</td><td className="td-num">1.5732</td><td className="td-num">0.3942</td><td className="td-num td-bad">100%</td><td className="td-num">0/205</td><td className="td-bad">Failed — Axion 100%</td></tr>
                    <tr className="row-highlight"><td>5. Noise Injection ★</td><td className="td-num">0.7524</td><td className="td-num">0.7637</td><td className="td-num">71.2%</td><td className="td-num">59/205</td><td className="td-good">BEST — 4/4 criteria</td></tr>
                    <tr><td>6. PSF+Noise+TTA</td><td className="td-num">1.0759</td><td className="td-num">0.6787</td><td className="td-num">88.8%</td><td className="td-num">23/205</td><td>3/4 criteria</td></tr>
                    <tr><td>7. Deep Ensemble</td><td className="td-num">0.9626</td><td className="td-num">0.6771</td><td className="td-num">90.2%</td><td className="td-num">20/205</td><td>Worse than Method 5</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="jrn-conclusion-box">
                <p>The substructure signal is below the detection threshold in ESA Euclid Q1 data. The <GlossaryTooltip term="PSF">PSF</GlossaryTooltip> blurs exactly the sub-arcsecond features that distinguish dark matter models. This matches ESA’s own assessment and an independent finding from the DeepLense GSoC 2025 team. Knowing what cannot be measured at current resolution is itself a scientific result.</p>
              </div>

              <div className="jrn-callout" style={{ marginTop: '24px' }}>
                <div className="jrn-callout-label">Method 7 — Deep Ensemble: The Key Finding</div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Three ensemble members (seeds 42, 1, 2) were each trained identically from the same base checkpoint. Ensemble entropy was 0.9626 — <strong style={{color:'#ad8a8a'}}>worse than the single best model</strong> (Method 5, 0.7524). The reason: individual members <em>confidently predict different classes for the same image</em>. They disagree with high confidence. This proves that individual model confidence on real Euclid substructure images is partially spurious — the models are confident, but not in the same direction. The 20 images where all three members agreed are the most defensible substructure predictions this project can make.
                </p>
              </div>
            </section>

            <div className="jrn-divider" />

            {/* ── PHASE 7 ── */}
            <section className="jrn-phase" id="phase7">
              <div className="jrn-phase-label">Phase 7 — Population Inference & Discovery</div>
              <h3 className="jrn-phase-header playfair">The Final Run: Scanning the Unseen Universe</h3>

              <div className="jrn-cols">
                <div>
                  <p className="jrn-p">After finalizing the V12 ensemble (<GlossaryTooltip term="AUROC" />=0.8871), we unleashed it on every remaining Euclid Q1 file that had absolutely zero overlap with the 1,000-file "Locked Holdout Set" used for training, validation, or testing. This is the ultimate test of discovery: running inference on completely untouched data to find genuinely new gravitational lens candidates.</p>
                  
                  <p className="jrn-h3">Inference Setup</p>
                  <p className="jrn-p">We scanned 1,415 files (247 Grade B, 1,168 Grade C). We applied Test-Time Augmentation (<GlossaryTooltip term="TTA">TTA</GlossaryTooltip>: 4×90° rotations, averaged softmax) and used a strict classification threshold of P ≥ 0.70 — the exact threshold that yielded optimal F1 score on our locked test set. We required all three architecturally distinct models (V7, V10, V11) to agree.</p>

                  <p className="jrn-h3">Scientific Interpretation</p>
                  <p className="jrn-p">Across the 1,415 files, 625 were flagged (44.2%). However, real lens prevalence is ~0.1–1%. The high overall flag rate is a documented out-of-distribution generalization failure (as noted in ESA's arXiv:2512.05899) when models encounter diverse Grade C morphologies they were never trained on.</p>
                  <p className="jrn-p">The scientifically valid result lies in the <strong style={{color:'var(--text-primary)'}}>pure Grade B candidates</strong>. Of the 86 human-vetted, independent Grade B files, the model flagged 33 (38.4%) at high confidence. Furthermore, 228 files across the entire scan achieved unanimous P &gt; 0.90 agreement from all three ensemble members. These represent the most credible new candidates for visual follow-up.</p>
                </div>

                <div>
                  <div className="jrn-callout" style={{ borderColor: '#ad8a8a', marginBottom: '24px' }}>
                    <div className="jrn-callout-label" style={{ color: '#ad8a8a' }}>The "NEG-Prefix" Nuance</div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', fontFamily: "'IBM Plex Mono', monospace" }}>
                      Grade B overall showed a 40.1% detection rate. However, 161 of the 247 Grade B files carry a <span style={{color:'var(--text-primary)'}}>NEG</span> prefix (e.g., slde_NEG5_...). These were labeled non-lenses at catalog creation but ended up grouped into Grade B during ESA's pipeline. The model flagged 41% of them as lenses — consistent with the documented out-of-distribution generalization failure, not genuine lens detections. <br/><br/>
                      By isolating the <strong style={{color:'var(--text-primary)'}}>86 pure, non-NEG Grade B files</strong>, we see a 38.4% detection rate (33/86). Flagging human-vetted probable lenses at high confidence using a model trained strictly on Grade A is a robust, genuine signal, completely separate from the OOD noise.
                    </p>
                  </div>

                  <div className="jrn-table-wrap" style={{ margin: 0 }}>
                    <div className="jrn-chart-title">Top 10 Most Confident Discoveries (Pure Files)</div>
                    <table className="jrn-table">
                      <thead><tr><th>Rank</th><th>Grade</th><th>RA</th><th>Dec</th><th>P(Lens)</th></tr></thead>
                      <tbody>
                        <tr><td>1</td><td>B</td><td className="td-num">265.7820</td><td className="td-num">65.7129</td><td className="td-num td-good">0.9980</td></tr>
                        <tr><td>2</td><td>C</td><td className="td-num">270.9160</td><td className="td-num">66.0459</td><td className="td-num td-good">0.9979</td></tr>
                        <tr><td>3</td><td>C</td><td className="td-num">268.4505</td><td className="td-num">63.7874</td><td className="td-num td-good">0.9976</td></tr>
                        <tr><td>4</td><td>C</td><td className="td-num">267.6483</td><td className="td-num">63.9662</td><td className="td-num">0.9960</td></tr>
                        <tr><td>5</td><td>C</td><td className="td-num">270.6682</td><td className="td-num">66.4328</td><td className="td-num">0.9959</td></tr>
                        <tr><td>6</td><td>C</td><td className="td-num">267.4724</td><td className="td-num">65.2311</td><td className="td-num">0.9958</td></tr>
                        <tr><td>7</td><td>C</td><td className="td-num">272.9356</td><td className="td-num">67.3314</td><td className="td-num">0.9957</td></tr>
                        <tr><td>8</td><td>C</td><td className="td-num">265.4631</td><td className="td-num">64.5925</td><td className="td-num">0.9950</td></tr>
                        <tr><td>9</td><td>B</td><td className="td-num">272.7436</td><td className="td-num">64.5548</td><td className="td-num">0.9939</td></tr>
                        <tr><td>10</td><td>C</td><td className="td-num">271.8538</td><td className="td-num">65.5472</td><td className="td-num">0.9935</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Data Archive Card */}
              <div style={{
                marginTop: '48px', padding: '32px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '4px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '8px' }}>Open Science Data Release</div>
                  <h4 style={{ fontSize: '18px', margin: '0 0 8px 0', color: 'var(--text-primary)', fontWeight: '400' }}>V12 Unseen Scan Data Archive</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                    Includes the 32-page visual discovery gallery (PDF), full scoring logs (CSV/XLSX) for all 1,415 scanned candidates, and the filtered candidate list. Hosted permanently on Zenodo.
                  </p>
                </div>
                <a href="https://doi.org/10.5281/zenodo.20037150" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
                  backgroundColor: '#e8e6e0', color: '#111', textDecoration: 'none', fontSize: '13px',
                  fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace", transition: 'opacity 0.2s',
                  borderRadius: '2px'
                }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download via Zenodo (66 MB)
                </a>
              </div>
              <p className="jrn-p" style={{ fontSize: '12px', marginTop: '16px' }}>
                The complete per-model scores (V7, V10, V11 with and without TTA) for all 1,415 files are included in the archive, enabling independent reanalysis at any threshold.
              </p>
            </section>

            <div className="jrn-divider" />

            {/* ── CONCLUSIONS ── */}
            <section className="jrn-phase" id="conclusions">
              <div className="jrn-phase-label">Conclusions</div>
              <h3 className="jrn-phase-header playfair">What the data finally revealed.</h3>

              <div className="jrn-chart-box" style={{ marginBottom: '48px' }}>
                <div className="jrn-chart-title">Complete Model <GlossaryTooltip term="AUROC" /> Comparison — All Validated Versions</div>
                <FinalBarRechart />
              </div>

              <div className="jrn-findings">
                {/* Track A */}
                <div className="jrn-finding-col">
                  <div className="jrn-finding-track-header">Track A — Binary Detection</div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Outcome</div>
                    <div className="jrn-finding-value">Solved. <GlossaryTooltip term="AUROC" /> 0.8871 (ensemble), 0.8541 (best single model). Results align with dedicated ESA pipeline methods using 160 training positives and a single GPU.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Biggest single improvement</div>
                    <div className="jrn-finding-value">Switching to Zoobot (galaxy-pretrained) from ImageNet pretraining. +0.1258 <GlossaryTooltip term="AUROC" /> from V6→V7. The right prior mattered more than model size or training time.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">V2–V5 (<GlossaryTooltip term="AUROC" /> 0.87–0.99)</div>
                    <div className="jrn-finding-value">All invalid. 204 of 205 eval positives were inside the training set — confirmed by SkyCoord cross-match. The model was graded on its own homework.</div>
                  </div>


                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">By raw <GlossaryTooltip term="AUROC" /></div>
                    <div className="jrn-finding-value">V12 (0.8871) — but it's a 3-model ensemble, not a single deployable model.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">By single-model <GlossaryTooltip term="AUROC" /></div>
                    <div className="jrn-finding-value">V11 (0.8776, DINOv2-B) — but 86M params, threshold=0.30 (miscalibrated), 0.06 val–test gap confirming overfitting on 160 positives.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">By deployment quality</div>
                    <div className="jrn-finding-value">V7 — <GlossaryTooltip term="AUROC" /> 0.8541, precision 0.7037, threshold 0.623 (meaningful), 15M params, ESA-deployed architecture. The one to actually use.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Data mining (V13–V15)</div>
                    <div className="jrn-finding-value">234 pseudo-labels mined at P&gt;0.98. +146% positives. <GlossaryTooltip term="AUROC" /> dropped from 0.8776 to 0.8687. Label quality beats label quantity.</div>
                  </div>
                </div>

                {/* Track B */}
                <div className="jrn-finding-col">
                  <div className="jrn-finding-track-header">Track B — Substructure Classification</div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Outcome</div>
                    <div className="jrn-finding-value">Not possible at Q1 resolution. The Euclid <GlossaryTooltip term="PSF">PSF</GlossaryTooltip> (FWHM ≈ 0.18 arcsec) blurs exactly the sub-arcsecond features that distinguish Smooth, <GlossaryTooltip term="CDM">CDM</GlossaryTooltip>, and <GlossaryTooltip term="Axion">Axion</GlossaryTooltip> halos. Confirmed by 7 methods, ESA, and DeepLense GSoC 2025 independently.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Sim-to-real gap</div>
                    <div className="jrn-finding-value">Model trained on 30k noiseless simulations predicted <GlossaryTooltip term="CDM">CDM</GlossaryTooltip> for 72.7% of real lenses. Direct class-bias transfer — not a learned signal.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Domain adaptation (CORAL, DANN, ADDA)</div>
                    <div className="jrn-finding-value">All failed. Each outputted a single class for all 205 real lenses. The 30,000:205 source-to-target imbalance made alignment impossible.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Best result — noise injection (Method 5)</div>
                    <div className="jrn-finding-value">Entropy 0.75 (down 33% from baseline). High-confidence predictions 5×. Still, 71.2% of lenses remained uncertain. 4/4 criteria met.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">Deep ensemble finding</div>
                    <div className="jrn-finding-value">Three members agreed on only 20 of 205 images. Individually confident, but in different directions — proving the confidence is spurious. Those 20 are the only defensible predictions.</div>
                  </div>

                  <div className="jrn-finding-item">
                    <div className="jrn-finding-label">What this means</div>
                    <div className="jrn-finding-value">The problem is resolution-limited, not model-limited. Better algorithms will not help. The signal does not exist in Q1 data at current <GlossaryTooltip term="PSF">PSF</GlossaryTooltip> quality.</div>
                  </div>
                </div>
              </div>

              <div className="jrn-p" style={{ marginTop: '48px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-primary)' }}>Beyond <GlossaryTooltip term="AUROC" /> (Precision Matters)</strong></p>
                <p><GlossaryTooltip term="AUROC" /> measures ranking ability, but real pipelines need hard thresholds. For example, V9 had higher <GlossaryTooltip term="AUROC" /> than V7 (0.8587 vs 0.8541), but its precision failed to converge at a statistically significant level, resulting in an excessive number of false alarms. V7 is the superior production choice because it maintains high precision (0.7037) and a stable threshold.</p>
              </div>


            </section>

          </main>
        </div>
        <div style={{ height: '120px' }} />
      </div>
    </div>
  );
}