import * as React from 'react';

const findNode = (graph: any, id: any) => graph.nodes.find((n: any) => n.id === id);

export default class Graph extends React.Component<any, any> {
  handleNodeClick(node: object) {
    return () => {
      this.props.onNodeClick(node);
    }
  }

  handleEdgeClick(edge: object) {
    return () => {
      this.props.onEdgeClick(edge);
    }
  }

  render() {
    const {graph} = this.props;
    const edgeViews = graph.edges.map((e:any) => {
      const handleEdgeClick = this.handleEdgeClick(e);
      const o = findNode(graph, e.origin);
      const d = findNode(graph, e.destination);
      const path = `M${o.x} ${o.y} L${d.x} ${d.y}`;
      return (
        <g key={`${o.id}-${d.id}`} onClick={handleEdgeClick}>
          <path d={path} stroke="black" strokeWidth="12" fill="transparent" />
          <path d={path} stroke="#61DAFB" strokeWidth="8" fill="transparent" />
        </g>
      );
    });

    const nodeViews = graph.nodes.map((n:any) => {
      const handleNodeClick = this.handleNodeClick(n);
      const r = n.r || 60;
      const strokeWidth = n.selected ? r/7 : r/15;
      const fill = n.selected ?  "#47aac6" : "#61DAFB";
      return (
        <g key={n.id} onClick={handleNodeClick}>
          <circle cx={n.x} cy={n.y} r={r} strokeWidth={strokeWidth} fill={fill} />
          <text fill="black" textAnchor="middle" alignmentBaseline="central" fontSize="30px"
            x={n.x} y={n.y}>{n.label !== undefined ? n.label : n.id}</text>
        </g>
      );
    });

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="500px">
        <g>
          {edgeViews}
        </g>
        <g stroke="black">
          {nodeViews}
        </g>
      </svg>
    );
  }
}