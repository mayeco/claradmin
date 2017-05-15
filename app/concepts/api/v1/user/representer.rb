# frozen_string_literal: true
module API::V1
  module User
    module Representer
      class Show < Roar::Decorator
        include Roar::JSON::JSONAPI.resource :users
        include Default::Representer::NonStrictNaming

        attributes do
          property :label, getter: ->(user) do
            user[:represented].name
          end
          property :name
          property :email
          property :role
          property :user_team_ids
        end

        has_many :user_teams do
          type :user_teams

          attributes do
            property :name
            property :label, getter: ->(user_team) do
              user_team[:represented].name
            end
          end
        end

        has_many :led_teams do
          type :user_teams

          attributes do
            property :name
            property :label, getter: ->(led_team) do
              led_team[:represented].name
            end
          end
        end

        # collection :created_assignments do
        #   property :id
        #   property :message, as: :label
        # end
        #
        # collection :received_assignments do
        #   property :id
        #   property :message, as: :label
        # end
      end

      class Update < Roar::Decorator
        include Roar::JSON::JSONAPI.resource :users

        attributes do
          property :name
          property :email
          property :role
        end
      end
    end
  end
end
