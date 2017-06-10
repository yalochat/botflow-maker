import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {RaisedButton, TextField, Table, TableHeader, TableRow, TableHeaderColumn, TableRowColumn, TableBody } from 'material-ui';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';

const EditTable = require('material-ui-table-edit')


const { List } = require('immutable')
import './App.css'

const flow = [
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
]

const createState = (state) => {
  flow.push(state)
  refreshRender()
}

const findState = (name) => {

  let filter = flow.filter((state) => {
    return state.name === name
  })
  
  if (filter.length > 0) {
    return filter.reduce((a, b) => {
      return a || b
    })
  } else {
    return null
  }
}

let data = [];

const refreshRender = () => {
  console.log("refreshRender")
  console.log(flow)
  data = flow.map(v => {

    let chart = v.chart || {}
    chart = Object.assign({}, chart, {
      x: chart.x || 0,
      y: chart.y || 0
    })

    const transitions = v.transitions.map((t) => {
      const transitionChart = t.chart || {}
      const state = findState(t.to)
      const x2 = (!state) ? 0 : state.chart.x
      const y2 = (!state) ? 0 : state.chart.y
      return Object.assign({}, t, {
        chart: {
          x1: transitionChart.x1 || chart.x || 0,
          y1: transitionChart.y1 || chart.y || 0,
          x2: chart.x2 || x2 || 0,
          y2: chart.y2 || y2 || 0
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
      waitForCreate: false,
      mouseClass: 'default',
      createNewState: false,
      x: 0,
      y: 0
    }
    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.prepareToCreateNewState = this.prepareToCreateNewState.bind(this)
    this.onClick = this.onClick.bind(this)
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

  updateProperty(type, object, value) {
    console.log(type, value, object)
    if (this.state.currentNode) {
      let state = this.state;
      state.currentNode[type] = value
      this.setState(state)
      console.log(state)
    }
    this.updateState()
  }

  addTransition() {

  }

  //TODO: No depender del index para modificar
  updateTransition(type, index, object, value) {
    console.log(object, type, index, value)
    if (this.state.currentNode.transitions) {
      if (index == -1) {
        let state = this.state;
        let newTransition = {when: '', to: ''}

        if (type === 'when') {
          newTransition.when = value
        } else {
          newTransition.to = value
        }
        state.currentNode.transitions.push(newTransition)
        this.setState(state)
      } else {
        let state = this.state;
        if (type === 'when') {
          state.currentNode.transitions[index].when =  value
        } else {
          state.currentNode.transitions[index].to =  value
        }
        this.setState(state)
      }
    }
    this.updateState()
  }

  updateState() {
    let stateName = this.state.currentNode.name
    let i = flow.indexOf(flow.find(function(item) {
      return item.name == stateName
    }))
    if (i >= 0) {
      flow[i] = this.state.currentNode
    } else {
      flow.push(this.state.currentNode)
    }
    
    refreshRender()
  }

  renderTransitions() {
    if (!this.state.currentNode.transitions) {
      return []
    }

    let transitions = []
    for (let i = 0; i < this.state.currentNode.transitions.length ; i++) {
      let state = this.state.currentNode.transitions[i];
      let element = (
        <TableRow>
          <TableRowColumn> <TextField onChange={this.updateTransition.bind(this, 'when', i)} value={state.when}></TextField></TableRowColumn>
          <TableRowColumn> <TextField onChange={this.updateTransition.bind(this, 'to', i)} value={state.to}></TextField></TableRowColumn>
        </TableRow>
      );
      transitions.push(element)
    }
    
    for (let i = 0; i < 4 ; i++) {
      let element = (
        <TableRow>
          <TableRowColumn> <TextField onChange={this.updateTransition.bind(this, 'when', -1)} ></TextField></TableRowColumn>
          <TableRowColumn> <TextField onChange={this.updateTransition.bind(this, 'to', -1)} ></TextField></TableRowColumn>
        </TableRow>
      );
      transitions.push(element)
    }

    let result = (
      <div>
      <RaisedButton label="Agregar transición" secondary={true} onClick={this.addTransition}/>

    <Table  selectable={false}
                            multiSelectable={false}>
      <TableHeader>
        <TableRow>
          <TableHeaderColumn>Condición</TableHeaderColumn>
          <TableHeaderColumn>Nuevo estado</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>{transitions}</TableBody>
      
    </Table>
    </div>)

    return result
  }

  onClick() {
    if(this.state.waitForCreate){
      flow.push({
        name: 'new-state' + flow.length + 1,
        chart: {
          x: this.state.x,
          y: this.state.y - 170
        },
        transitions: []
      })
      refreshRender()
      this.setState({
      waitForCreate: false,
      mouseClass: 'default'
    })
      //this.setState({createNewState: true})
    }
  }

  prepareToCreateNewState(state) {
    console.log(state)
    this.setState({
      waitForCreate: state,
      mouseClass: 'crosshair'
    })
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

      let xy = nodes[0].getAttribute('transform').replace('translate(','').replace(')','').split(',')
      let x = parseInt(nodes[0].getAttribute('x')) + parseInt(xy[0])
      let y = parseInt(nodes[0].getAttribute('y')) + parseInt(xy[1])

      for(let i = 0; i < nodes.length; i++) {
        let item = nodes[i]
        let xy = item.getAttribute('transform').replace('translate(','').replace(')','').split(',')
        let x = parseInt(item.getAttribute('x')) + parseInt(xy[0])
        let y = parseInt(item.getAttribute('y')) + parseInt(xy[1])
        item.setAttribute("x", x)
        item.setAttribute("y", y)
        item.setAttribute("transform", "translate(0,0)")
      }

      
      console.log(xy)
      flow = flow.map(v => {
        return data.name === v.name? Object.assign(v, {chart: {x: x, y: y}}) : v
      })

      refreshRender()
    }

  }

  render() {
    const actions = [
      <RaisedButton
        primary={true}
        label="Cerrar"
        onClick={this.handleCloseModal}
      />
    ];

    return (
      <div onMouseMove={this._onMouseMove.bind(this)}>
        <h1>Mouse coordinates: {this.state.x} {this.state.y} {this.state.waitForCreate}</h1>
        <Menu prepareToCreateNewState={this.prepareToCreateNewState} x={this.state.x} y={this.state.y}></Menu>
        <svg onClick={this.onClick} height="2100" width="5000" style={{ cursor: this.state.mouseClass }}>
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
              <label>Nombre</label><br/>
              <TextField
                hintText="Nombre del estado"
                value={this.state.currentNode.name}
                onChange={this.updateProperty.bind(this, 'name')}
              />
              <br />
              <label>Template</label><br/>
              <TextField
                hintText="Template"
                value={this.state.currentNode.template}
                onChange={this.updateProperty.bind(this, 'template')}
              />
              <br />
              <br />
              <label>Transiciones</label><br/>
              <hr/>
              {this.renderTransitions()}
          </form>
        </Dialog>
        <Dialog title="Nuevo estado" modal={true} open={this.state.createNewState}>
          <button onClick={this.handleCloseModal}>Cerrar</button>
        </Dialog>
      </div >
    );
  }
}

class Node extends React.Component {
  render() {
    return (
      <g id={this.props.step.name} onDoubleClick={this.props.open.bind(this, this.props.step)} onMouseDown={this.props.dragMouseDown.bind(this, this.props.step)} onMouseMove={this.props.dragMove.bind(this, this.props.step)} onMouseUp={this.props.dragEndMove.bind(this, this.props.step)} onMouseOut={this.props.dragEndMove.bind(this)}>
        <rect x={this.props.step.chart.x} y={this.props.step.chart.y} width="150" height="50" style={{ fill: 'white', stroke: 'blue', strokeWidth: 1, opacity: 1 }} className="node" />
        <text x={this.props.step.chart.x + 10} y={this.props.step.chart.y + 20} fontFamily="Verdana" fontSize="15" fill="black">{this.props.step.name}</text>
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
        <line x1={getLine(this.props.t.chart).x1} y1={getLine(this.props.t.chart).y1} x2={getLine(this.props.t.chart).x2} y2={getLine(this.props.t.chart).y2} style={{ fill: 'blue', stroke: 'green', strokeWidth: 5, opacity: 0.2 }} className="transition" />
        <text x={(this.props.t.chart.x1 + this.props.t.chart.x2) / 2} y={((getLine(this.props.t.chart).y1 + getLine(this.props.t.chart).y2) / 2)} fontFamily="Verdana" fontSize="10" fill="black">{this.props.t.when}</text>
        <circle cx={getLine(this.props.t.chart).x2} cy={getLine(this.props.t.chart).y2} r="3" />
      </g>
    )
  }
}

class Menu extends React.Component {
  openCreateNewDialog(props) {
    console.log(props)
    console.log(`X:${props.x} Y:${props.y}`)
  }
  render() {
    return (
      <div>
        <button onClick={this.props.prepareToCreateNewState.bind(this, true)}>Nuevo estado</button>
      </div>
    )
  }
}

export default App;
