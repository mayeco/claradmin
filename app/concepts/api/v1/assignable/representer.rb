# frozen_string_literal: true
module API::V1
  module Assignable
    module Representer
      # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
      def self.included(base)
        base.attributes do
          # method (uses scopes) to get current_assignment
          property :current_assignment_id, getter: ->(item) do
            ::Assignable::Twin.new(item[:represented]).current_assignment.id
          end
          property :assignment_ids
        end

        base.has_many :assignments, class: ::Assignment do
          type :assignments

          attributes do
            property :message
            property :label, getter: ->(item) { item[:represented].message }
            property :creator_id
            property :creator_team_id
            property :receiver_id
            property :receiver_team_id
            property :assignable_id
            property :assignable_type
            property :assignable_field_type
            property :aasm_state
            property :parent_id
            property :created_at
            property :updated_at
            property :topic
            property :created_by_system
          end
        end
      end
      # rubocop:enable Metrics/AbcSize, Metrics/MethodLength
    end
  end
end
