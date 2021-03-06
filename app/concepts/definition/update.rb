# frozen_string_literal: true

class Definition::Update < Definition::Create
  step Model(::Definition, :find_by), replace: 'model.build'
  step ::Lib::Macros::Live::SendChanges()
end
