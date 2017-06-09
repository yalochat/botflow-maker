import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { RaisedButton, TextField } from 'material-ui';

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

const createState = (state) => {
  flow.push(state)
  refreshRender()
}

const findState = (name) => {
  return flow.filter((state) => {
    return state.name === name
  }).reduce((a, b) => {
    return a || b
  })
}

let data = [];

const refreshRender = () => {
  console.log("refreshRender")
  data = flow.map(v => {

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

let click=false; // flag to indicate when shape has been clicked
let clickX, clickY; // stores cursor location upon first click
let moveX=0, moveY=0; // keeps track of overall transformation
let lastMoveX=0, lastMoveY=0; // stores previous transformation (move)

class App extends Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      currentNode: {},
      createNewState: false,
      x: 0,
      y: 0
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  _onMouseMove(e) {
    this.setState({ x: e.screenX, y: e.screenY });
  }

  handleOpenModal(data) {
    const state = JSON.parse(data.detail)
    console.log(state)
    this.setState({ showModal: true, currentNode: state });
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    }
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  renderTransitions() {

  }

  dragMouseDown(data, evt){
    evt.preventDefault() // Needed for Firefox to allow dragging correctly
    click = true
    clickX = evt.clientX 
    clickY = evt.clientY

    let g = document.getElementById(data.name)
    if(g) {
      g.style.zIndex = "200"
    }

  }

  dragMove(data, evt){
    evt.preventDefault()
    if(click){
      moveX = lastMoveX + ( evt.clientX - clickX )
      moveY = lastMoveY + ( evt.clientY - clickY )

      let g = document.getElementById(data.name)

      if(g) {
        let nodes = g.childNodes
        for(let i = 0; i < nodes.length; i++) {
          nodes[i].setAttribute("transform", "translate(" + moveX + "," + moveY + ")")
        }
      }
      
    }
  }

  dragEndMove(data, evt){
    click = false
    lastMoveX = 0
    lastMoveY = 0

    let g = document.getElementById(data.name)
    if(g) {
      g.style.zIndex = "0"

      let nodes = g.childNodes

      for(let i = 0; i < nodes.length; i++) {
        let item = nodes[i]
        let xy = item.getAttribute('transform').replace('translate(','').replace(')','').split(',')
        let x = parseInt(item.getAttribute('x')) + parseInt(xy[0])
        let y = parseInt(item.getAttribute('y')) + parseInt(xy[1])
        item.setAttribute("x", x)
        item.setAttribute("y", y)
        item.setAttribute("transform", "translate(0,0)")
      }
      refreshRender()
    }

  }

  render() {
    const actions = [
      <RaisedButton
        label="Modificar"
        primary={true}
        onClick={this.handleCloseModal}
      />,
      <RaisedButton
        label="Cerrar"
        onClick={this.handleCloseModal}
      />
    ];

    return (
      <div onMouseMove={this._onMouseMove.bind(this)}>
        <h1>Mouse coordinates: {this.state.x} {this.state.y}</h1>
        <Menu createNew={this.state.createNewState}></Menu>
        <svg height="2100" width="5000">
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
          <g>{
            data.map((step, k) => (
              <Node key={k} step={step} open={this.handleOpenModal} dragMouseDown={this.dragMouseDown} dragMove={this.dragMove} dragEndMove={this.dragEndMove}/>
            ))}
          </g>
        </svg>
        <Dialog title="Editar evento" modal={true} open={this.state.showModal} actions={actions}>
          <form>
            <label>Nombre</label><br />
            <TextField
              hintText="Nombre del estado"
              value={this.state.currentNode.name}
            />
            <br />
            <label>Template</label><br />
            <TextField
              hintText="Template"
              value={this.state.currentNode.template}
            />
            <br />
            <br />
            <label>Transiciones</label><br />
            <hr />

          </form>
        </Dialog>
      </div>
    );
  }
}


class Node extends React.Component {
  render() {
    return (
      <g id={this.props.step.name} onDoubleClick={this.props.open.bind(this, this.props.step)} onMouseDown={this.props.dragMouseDown.bind(this, this.props.step)} onMouseMove={this.props.dragMove.bind(this, this.props.step)} onMouseUp={this.props.dragEndMove.bind(this, this.props.step)} onMouseOut={this.props.dragEndMove.bind(this)}>
        <rect x={this.props.step.chart.x} y={this.props.step.chart.y} rx="5" ry="5" width="150" height="50" style={{ fill: 'blue', stroke: 'pink', strokeWidth: 5, opacity: 0.5 }} className="node" />
        <text x={this.props.step.chart.x + 10} y={this.props.step.chart.y + 20} fontFamily="Verdana" fontSize="15" fill="red">{this.props.step.name}</text>
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

class Menu extends React.Component {
  createNew
  render() {
    return (
      <div>
        <button>Nuevo estado</button>
        <Dialog title="Nuevo estado" modal={true} open={this.props.createNewState}>
          <button onClick={this.handleCloseModal}>Cerrar</button>
        </Dialog>
      </div>
    )
  }
}

export default App;
