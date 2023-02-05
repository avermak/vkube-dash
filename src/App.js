import './App.css';
import { useEffect, useState } from 'react';
import {log} from './util.js'

const initialState = {
  clusterInfo: {},
  nodes: {}
}

function App() {

  const [state, setState] = useState(initialState);

  const updateDT = nodes => {
    const now = Date.now();
    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName];
      node.stale = (now - node.lastUpdated > 60000);
      Object.keys(node.pods).forEach(podName => {
        const pod = node.pods[podName];
        const dt = Math.round((now - pod.lastUpdated)/1000);
        if (dt < 30) {
          pod.dt = dt === 0 ? 'now' : `${dt} seconds ago`;
          pod.stale = false;
        } else {
          pod.dt = `${Math.round(dt/60)}:${dt%60} ago`;
          pod.stale = true;
        }
        if (dt > 300) {
          delete node.pods[podName];
        }
      });
    });
  }

  const processServerResponse = data => {
    const now = new Date();
    const nodes = state.nodes;
    let node = nodes[data.nodeName];
    if (!node) {
      node = {};
      nodes[data.nodeName] = node;
    }
    node.nodeName = data.nodeName;
    node.nodeIP = data.nodeIP;
    node.cpuTemperatures = data.cpuTemperatures;
    node.cpuUsage = data.cpuUsage;
    node.cpuCores = data.cpuCores;
    node.lastUpdated = now;
    
    let pods = node.pods;
    if (!pods) {
      pods = {};
      node.pods = pods;
    }
    let pod = pods[data.podName];
    if (!pod) {
      pod = {};
      pods[data.podName] = pod;
    }
    pod.podName = data.podName;
    pod.podIP = data.podIP;
    pod.totalMemory = data.totalMemory;
    pod.freeMemory = data.freeMemory;
    pod.lastUpdated = now;

    updateDT(nodes);
    log(`New nodes data for state: ${JSON.stringify(nodes)}`);
    setState({nodes});
  }
  
  const fetcher = async () => {
    //log(`Refreshing data from server`);
    const res = await fetch(`https://192.168.1.80/health`);
    if (res.status !== 200) {
      log(`Error fetching data from server. ${res.status} - ${res.statusText}`);
      return;
    }
    const data = await res.json();
    //log(`Response: ${JSON.stringify(data)}`);
    try {
      processServerResponse(data);  
    } catch (e) {
      log(`Error processing server response. ${e}`);
    }
  };
  
  useEffect(() => {
    fetcher();
    const fid = setInterval(fetcher, 3000);
    return ()=>{clearInterval(fid)};
  }, [])

  const renderNode = (node, ix) => {
    const podNames = Object.keys(node.pods);
    const rows = [];
    let pod = null;
    for (let i=0; i<podNames.length; i++) {
      pod = node.pods[podNames[i]];
      rows.push(
        <tr key={pod.podName} data-noderow={ix % 2 === 0 ? 'even' : 'odd'}>
          <td>{i === 0 ? node.nodeName : ''}</td>
          <td>{i === 0 ? node.nodeIP : ''}</td>
          <td>{i === 0 && node.cpuUsage.length === 2 ? `usr: ${node.cpuUsage[0]}%, sys: ${node.cpuUsage[1]}%` : ''}</td>
          <td>{i === 0 && node.cpuTemperatures.length ? `${node.cpuTemperatures[0]}°C` : ' '}</td>
          <td data-pod-stale={pod.stale}>{pod.podName}</td>
          <td data-pod-stale={pod.stale}>{pod.podIP}</td>
          <td data-pod-stale={pod.stale}>{`${pod.totalMemory} MB`}</td>
          <td data-pod-stale={pod.stale}>{`${pod.freeMemory} MB`}</td>
          <td data-pod-stale={pod.stale}>{pod.dt}</td>
        </tr>
      );
    }
    return rows;
  }

  return (
    <div className="app">
      <header className="app-header">
        <span>vkube</span>
      </header>
      <div className="app-body">
        <table className='data-table'>
          <tbody>
          <tr>
            <th>Node Name</th><th>Node IP</th><th>CPU Usage</th><th>CPU Temp (°C)</th>
            <th>Pod Name</th><th>Pod IP</th><th>Total Memory</th><th>Free Memory</th><th>Last Updated</th>
          </tr>
          {
            Object.keys(state.nodes).sort().map((nodeName, i) => {
              const node = state.nodes[nodeName];
              return renderNode(node, i);
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
