import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router'

export default class TableHeadCell extends Component {
  render() {
    const {
      href
    } = this.props

    return (
      <th>
        <Link to={href}>
          {this.renderFieldName()}
          {this.renderSortSymbol()}
        </Link>
      </th>
    )
  }

  renderSortSymbol() {
    if (this.props.isCurrentSortField) {
      if (this.props.currentDirection == 'ASC') {
        return <i className='fa fa-caret-up' />
      } else {
        return <i className='fa fa-caret-down' />
      }
    }
  }

  renderFieldName() {
    if (this.props.isCurrentSortField) {
      return <u>{this.props.displayName}</u>
    } else {
      return this.props.displayName
    }
  }
}
