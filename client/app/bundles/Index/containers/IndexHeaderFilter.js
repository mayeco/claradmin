import { connect } from 'react-redux'
import omit from 'lodash/omit'
import clone from 'lodash/clone'
import merge from 'lodash/merge'
import filter from 'lodash/filter'
import isArray from 'lodash/isArray'
import { encode } from 'querystring'
import { browserHistory } from 'react-router'
import settings from '../../../lib/settings'
import { setUi } from '../../../Backend/actions/setUi'
import { setQuery } from '../../../Backend/actions/setQuery'
import { analyzeFields } from '../../../lib/settingUtils'
import { singularize } from '../../../lib/inflection'
import loadAjaxData from '../../../Backend/actions/loadAjaxData'
import IndexHeaderFilter from '../components/IndexHeaderFilter'


const mapStateToProps = (state, ownProps) => {
  const model = ownProps.model
  const filterName = /\[([\w-]+)\]/.exec(ownProps.filter[0])[1]
  const filterAttributes = state.entities['field-sets'] && state.entities['field-sets'][model] ?
    state.entities['field-sets'][model]['columns'].find(field =>
      field.name == filterName) : undefined
  const filterOptions =
    filterAttributes ? filterAttributes.options : []
  const filterType =
    filterAttributes ? setFilterType(filterAttributes.type) : ''
  const filterValue = getValue(ownProps.filter[1], 0)
  const secondFilterValue = getValue(ownProps.filter[1], 1)
  const nilChecked = filterValue == 'nil'
  // only show filters that are not locked
  const fields =
    analyzeFields(settings.index[model].fields, model).filter(value =>
      !ownProps.lockedParams ||
        !ownProps.lockedParams.hasOwnProperty(`filters[${value.field}]`)
    )
  const operatorName = ownProps.params[`operators[${filterName}]`] || '='
  const range =
    (operatorName == "..." && filterType != 'text') ? 'visible' : 'hidden'
  const operators = filterOpperators(settings, filterType)

  return {
    filterName,
    nilChecked,
    filterType,
    fields,
    operators,
    operatorName,
    range,
    filterValue,
    secondFilterValue,
    filterOptions
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  // This response does not follow JSON API format, we need to transform it
  // manually
  const transformResponse = function(apiResponse, nextModel) {
    let object = { 'field-sets': {} }
    object['field-sets'][nextModel] = apiResponse
    return object
  }

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,

    loadData(nextModel = ownProps.model) {
      const singularModel = singularize(nextModel)

      // load field_set (all fields and associations of current model)
      dispatchProps.dispatch(
        loadAjaxData(
          'field_set/' + singularModel, {}, 'field-set',
          {
            transformer: transformResponse, nextModel
          }
        )
      )
    },

    onFilterValueChange(event) {
      console.log('onFilterValueChange!', event.target.value)
      let params = clone(ownProps.params)
      // if(params[ownProps.filter[0]]['second'] != undefined) {
      //   params[ownProps.filter[0]]['first'] = event.target.value
      // } else {
      //   params[ownProps.filter[0]] = { 'first': event.target.value }
      // }
      if (stateProps.range){
        console.log('range!')
        if (isArray(params[ownProps.filter[0]])){
          params[ownProps.filter[0]][0] = event.target.value
        } else {
          params[ownProps.filter[0]] = [event.target.value]
        }
      } else {
        params[ownProps.filter[0]] = event.target.value
      }
      console.log('onFilterValueChange new params:', params)
      dispatchProps.dispatch(setQuery('params', params))
      // let query = searchString(ownProps.model, params)
      // console.log('onFilterValueChange new query:', query)
      // browserHistory.replace(`/${query}`)
    },

    onSecondFilterValueChange(event) {
      console.log('onSecondFilterValueChange!', event.target.value)
      let params = clone(ownProps.params)
      // if(params[ownProps.filter[0]]['first'] != undefined) {
      //   params[ownProps.filter[0]]['second'] = event.target.value
      // } else {
      //   alert('Bitte gib einen Anfangswert ein');
      // }
      console.log(ownProps)
      if (stateProps.range){
        console.log('range!')
        console.log(params[ownProps.filter[0]])
        if (isArray(params[ownProps.filter[0]])){
          console.log('set second')
          params[ownProps.filter[0]][1] = event.target.value
        } else {
          console.log('set both')
          params[ownProps.filter[0]] = [event.target.value, event.target.value]
        }
      }
      // else {
      //   params[ownProps.filter[0]] = event.target.value
      // }
      console.log('onSecondFilterValueChange new params:', params)
      dispatchProps.dispatch(setQuery('params', params))
      // let query = searchString(ownProps.model, params)
      // console.log('onSecondFilterValueChange new query:', query)
      // browserHistory.replace(`/${query}`)
    },
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onTrashClick(event) {
    let filterName = /\[([\w-]+)\]/.exec(ownProps.filter[0])[1]
    const params = omit(clone(ownProps.params),
                  [ownProps.filter[0], 'operators[' + filterName])
    // let query = searchString(ownProps.model, params)
    dispatch(setQuery('params', params))
    // browserHistory.replace(`/${query}`)
  },

  onFilterNameChange(event) {
    let params = omit(clone(ownProps.params), ownProps.filter[0])
    let newParam = {}
    newParam[`filters[${event.target.value}]`] = ''
    params = merge(params, newParam)
    // let query = searchString(ownProps.model, params)
    dispatch(setQuery('params', params))
    // browserHistory.replace(`/${query}`)
  },

  onFilterOperatorChange(event) {
    let params = clone(ownProps.params)
    let newParam = {}
    let operator = event.target.value
    console.log('onFilterOperatorChange', operator)
    let filterName = /\[([\w-]+)\]/.exec(ownProps.filter[0])[1]
    newParam[`operators[${filterName}]`] = operator
    console.log('onFilterOperatorChange', filterName)
    params = merge(params, newParam)
    console.log('onFilterOperatorChange', params)
    // let query = searchString(ownProps.model, params)
    dispatch(setQuery('params', params))
    // browserHistory.replace(`/${query}`)
  },

  onCheckboxChange(event) {
    let params = clone(ownProps.params)
    if (event.target.checked) {
      params[ownProps.filter[0]] = 'nil'
    } else {
      params[ownProps.filter[0]] = ''
    }
    // let query = searchString(ownProps.model, params)
    dispatch(setQuery('params', params))
    // browserHistory.replace(`/${query}`)
  },

  dispatch
})

function setFilterType (filterType) {
  switch(filterType) {
    case 'datetime':
      return 'date'
    case 'integer':
      return 'number'
    default:
      return 'text'
  }
}

function getValue(filterValue, index) {
  return isArray(filterValue) ? filterValue[index] : filterValue
}


function textForOperator(operator) {
  switch(operator) {
    case '<':
      return 'kleiner als'
    case '>':
      return 'größer als'
    case '=':
      return 'genau gleich'
    case '!=':
      return 'nicht gleich'
    case '...':
      return 'zwischen'
    case 'ILIKE':
      return 'enthält'
    case 'NOT LIKE':
      return 'enthält nicht'
    default:
      return '???'
  }
}

function filterOpperators(settings, filterType) {
  if (filterType == 'text') {
    return settings.OPERATORS.filter(operator =>
      operator == '=' || operator == '!=' || operator == 'ILIKE' ||
      operator == 'NOT LIKE'
    ).map(operator => {
      return {
        value: operator,
        displayName: textForOperator(operator)
      }
    })
  } else {
    return settings.OPERATORS.map(operator => {
      return {
        value: operator,
        displayName: textForOperator(operator)
      }
    })
  }
}

// function searchString(model, params) {
//   if(window.location.href.includes(model)) {
//     // return `${model}?${jQuery.param(params)}`
//     return `${model}?${encode(params)}`
//   } else {
//     // return `?${jQuery.param(params)}`
//     return `?${encode(params)}`
//   }
// }

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(IndexHeaderFilter)
