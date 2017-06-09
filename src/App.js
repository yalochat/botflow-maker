import React, { Component } from 'react'
const { List } = require('immutable')
import './App.css'

const flow = List([
  {
    name: 'init',
    template: 'template1',
    chart: { x: 200, y: 150 },
    transitions: [
      {
        when: '/hola|get started|empezar/i',
        to: 'greeting',
      }
    ]
  },
  {
    name: 'greeting',
    template: 'greeting',
    chart: { x: 600, y: 100 },
    transitions: [
      {
        when: 'goto_catalog',
        to: 'ask-genre',
      },
      {
        when: '/hola|get started/i',
        to: 'greeting',
      },
      {
        when: '/*/i',
        to: 'ready-catalog',
      }
    ]
  },
  {
    name: 'ask-genre',
    template: 'ask-genre',
    chart: { x: 100, y: 400 },
    transitions: [
      {
        when: '/qr_man|qr_woman/',
        to: 'runner-catalog',
      },
      {
        when: 'uno',
        to: 'init',
      }
    ]
  },
  {
    name: 'runner-catalog',
    template: 'catalog',
    chart: { x: 400, y: 400 },
    transitions: [
      {
        when: '/catalog_wantit_button_/',
        to: 'ready-catalog',
      }
    ]
  },
  {
    name: 'ready-catalog',
    template: 'ready-catalog',
    chart: { x: 600, y: 200 },
    transitions: [

    ]
  },
  {
    name: 'ready-ref-product',
    template: 'ref-product',
    chart: { x: 600, y: 400 },
    transitions: [
    ]
  }
])

const addState = (state) => {
  flow.push(state)
}

const findState = (name) => {
  return flow.filter((state) => {
    return state.name === name
  }).reduce((a, b) => {
    return a || b
  })
}

const refreshRender = () => {
  const data = flow.map(v => {

    let chart = v.chart || {}
    chart = Object.assign({}, chart, {
      x: chart.x || 0,
      y: chart.y || 0
    })

    const transitions = v.transitions.map((t) => {
      const transitionChart = t.chart || {}
      return Object.assign({}, t, {
        chart: {
          x1: transitionChart.x1 || chart.x || 0,
          y1: transitionChart.y1 || chart.y || 0,
          x2: chart.x2 || findState(t.to).chart.x || 0,
          y2: chart.y2 || findState(t.to).chart.y || 0
        }
      })
    })
    return { name: v.name, transitions: transitions, chart: chart, detail: JSON.stringify(v) }
  })
}

refreshRender()

class App extends Component {
  render() {
    return (
      <svg height="2100" width="5000">
        <g>{
          data.map((step, k) => (
            <Node key={k} step={step} />
          ))}
        </g>
        <g>{
          data.map((step, k) => (
            <g key={k}>
              {
                step.transitions.map((t, k1) => (
                  <Transition key={k1} t={t} />
                ))
              }
            </g>
          ))}
        </g>
      </svg>
    );
  }
}

class Node extends React.Component {
  render() {
    return (
      <g>
        <rect x={this.props.step.chart.x} y={this.props.step.chart.y} rx="5" ry="5" width="150" height="50" style={{ fill: 'blue', stroke: 'pink', strokeWidth: 5, opacity: 0.5 }} className="node" />
        <text x={this.props.step.chart.x + 10} y={this.props.step.chart.y + 20} fontFamily="Verdana" fontSize="15" fill="white">{this.props.step.name}</text>
      </g>
    )
  }
}

class Transition extends React.Component {
  render() {
    const getLine = (chart) => {
      return {
        x1: chart.x1 + (chart.x2 >= (chart.x1 + 175) ? 150 : chart.x2 >= chart.x1 ? 75 : 0),
        y1: chart.y1 + (chart.y2 >= (chart.y1 + 75) ? 50 : chart.y2 >= chart.y1 ? 25 : 0),
        x2: chart.x2 + (chart.x1 >= (chart.x2 + 175) ? 150 : chart.x1 >= chart.x2 ? 75 : 0),
        y2: chart.y2 + (chart.y1 >= (chart.y2 + 75) ? 50 : chart.y1 >= chart.y2 ? 25 : 0),
      }
    }
    return (
      <g>
        <line x1={getLine(this.props.t.chart).x1} y1={getLine(this.props.t.chart).y1} x2={getLine(this.props.t.chart).x2} y2={getLine(this.props.t.chart).y2} style={{ fill: 'blue', stroke: 'pink', strokeWidth: 5, opacity: 0.5 }} className="transition" />
        <text x={(this.props.t.chart.x1 + this.props.t.chart.x2) / 2} y={((getLine(this.props.t.chart).y1 + getLine(this.props.t.chart).y2) / 2)} fontFamily="Verdana" fontSize="10" fill="black">{this.props.t.when}</text>
        <circle cx={getLine(this.props.t.chart).x2} cy={getLine(this.props.t.chart).y2} r="3" />
      </g>
    )
  }
}

export default App;
