# frozen_string_literal: true

# Monkeypatch clarat_base City
require ClaratBase::Engine.root.join('app', 'models', 'city')

class City < ApplicationRecord
  # Load thresholds from env-variables or use 1 for testing
  OFFER_THRESHOLD = Integer(ENV['THRESHOLDS_OFFER_COUNT'] || 1)
  ORGANIZATION_THRESHOLD = Integer(ENV['THRESHOLDS_ORGA_COUNT'] || 1)

  include ReformedValidationHack

  # Admin specific methods
  def thresholds_reached?
    organizations.where(aasm_state: 'all_done')
                 .count >= ORGANIZATION_THRESHOLD &&
      offers.visible_in_frontend.count >= OFFER_THRESHOLD
  end

  # Search
  include PgSearch
  pg_search_scope :search_pg,
                  against: %i[id name],
                  using: { tsearch: { prefix: true } }
end
