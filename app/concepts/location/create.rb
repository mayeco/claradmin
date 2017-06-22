# frozen_string_literal: true
class Location::Create < Trailblazer::Operation
  step Model(::Location, :new)
  step Policy::Pundit(LocationPolicy, :create?)

  step Contract::Build(constant: Location::Contracts::Create)
  step Contract::Validate()
  step Wrap(::Lib::Transaction) {
    step ::Lib::Macros::Nested::Find(:city, ::City)
    step ::Lib::Macros::Nested::Find(:federal_state, ::FederalState)
  }
  step Contract::Persist()
end
