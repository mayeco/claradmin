import GenericFormObject from '../lib/GenericFormObject'
import WebsiteFormObject from './WebsiteFormObject'

export default class DivisionFormObject extends GenericFormObject {
  static get model() {
    return 'division'
  }

  static get type() {
    return 'divisions'
  }

  static get properties() {
    return [
      'addition', 'organization', 'section', 'city', 'area', 'websites',
      'presumed-tags', 'presumed-solution-categories', 'comment',
      'size'
    ]
  }

  static get submodels() {
    return [
      'organization', 'websites', 'section', 'city', 'area',
      'presumed-tags', 'presumed-solution-categories'
    ]
  }

  static get submodelConfig() {
    return {
      websites: { relationship: 'oneToMany', object: WebsiteFormObject },
      section: { relationship: 'oneToOne' },
      city: { relationship: 'oneToOne' },
      area: { relationship: 'oneToOne' },
      organization: { relationship: 'oneToOne' },
      'presumed-tags': { relationship: 'oneToMany' },
      'presumed-solution-categories': { relationship: 'oneToMany' },
    }
  }

  static get formConfig() {
    return {
      addition: { type: 'string' },
      organization: { type: 'filtering-select' },
      section: { type: 'filtering-select' },
      city: { type: 'filtering-select' },
      area: { type: 'filtering-select' },
      websites: { type: 'creating-multiselect' },
      'presumed-tags': {
        type: 'filtering-multiselect', resource: 'tags'
      },
      'presumed-solution-categories': {
        type: 'filtering-multiselect', resource: 'solution-categories'
      },
      comment: { type: 'textarea' },
      size: { type: 'select', options: ['small', 'medium', 'large'] },
    }
  }

  static get requiredInputs() {
    return ['section']
  }

  validation() {
    for (let requiredInput of this.constructor.requiredInputs) {
      this.required(requiredInput).filled()
    }
  }
}
