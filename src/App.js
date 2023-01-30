import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import {log} from './util.js'

const initialState = {
  clusterInfo: {},
  nodes: {}
}

const fetcher = async () => {
  log(`Refreshing data from server`);
  const res = await fetch(`https://192.168.1.80/health`);
  log(await res.json())
};

function App() {

  const [state, setState] = useState(initialState);

  useEffect(() => {
    fetcher();
    // const fid = setInterval(fetcher, 10000);
    // return ()=>{clearInterval(fid)};
  })


  return (
    <div className="app">
      <header className="app-header">
        <span>vkube</span>
      </header>
      <div className="app-body">
        <table className='data-table'>
          <tbody>
          <tr>
            <th>Node Name</th><th>Node IP</th><th>CPU Usage</th><th>CPU Temp (C)</th><th>Memory</th><th>Pods</th>
          </tr>
          {Object.keys(state.nodes).map(n => {
            return (
            <tr>
              <td>{n}</td>
              <td>{state.nodes[n].nodeIP}</td>
            </tr>);
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
