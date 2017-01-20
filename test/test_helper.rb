ENV['RAILS_ENV'] ||= 'test'

require 'simplecov'
SimpleCov.start 'rails' do
  add_filter "/test/"
  # add_filter "/app/workers/subscribed_emails_mailings_spawner_worker.rb"
  # add_filter "/app/workers/uninformed_emails_mailings_spawner_worker.rb"
  minimum_coverage 100
end
require 'codeclimate-test-reporter'
CodeClimate::TestReporter.start

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'minitest/rails'
require 'minitest/rails/capybara'
require 'minitest/pride'
require 'mocha/mini_test'
require 'capybara/rails'

require 'minitest/autorun'
require 'minitest/spec'
require 'minitest/mock'
require 'minitest-matchers'
require 'minitest/hell'
require 'minitest/metadata'
require 'pry-rescue/minitest' if ENV['RESCUE']
require 'sidekiq/testing'
require 'fakeredis'

# Inclusions: First matchers, then modules, then helpers.
# Helpers need to be included after modules due to interdependencies.
Dir[Rails.root.join('test/support/matchers/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/support/modules/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/support/spec_helpers/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/features/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/workers/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/objects/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/models/*.rb')].each { |f| require f }
Dir[Rails.root.join('test/mailers/*.rb')].each { |f| require f }

# For Sidekiq
Sidekiq::Testing.inline!

# Redis
Redis.current = Redis.new
Capybara.asset_host = 'http://localhost:3000'

# JS Tests
Capybara.javascript_driver = :selenium
# Capybara.javascript_driver.manage.timeouts.implicit_wait = 30
# Capybara.javascript_driver.manage.timeouts.script_timeout = 30
# Capybara.javascript_driver.manage.timeouts.page_load = 30

# Setup Webmock to allow localhost connections and block everything else
WebMock.disable_net_connect!(:allow_localhost => true)

# For fixtures:
include ActionDispatch::TestProcess

# ~Disable logging for test performance!
# Change this value if you really need the log and run your suite again~
Rails.logger.level = 4

# Eager load everything for more accurate test coverage metric
# Rails.application.eager_load!

### Test Setup ###
File.open(Rails.root.join('log/test.log'), 'w') { |f| f.truncate(0) } # clearlog

silence_warnings do
  # BCrypt::Engine::DEFAULT_COST = BCrypt::Engine::MIN_COST # needed?
end

Minitest.after_run do
  if $suite_passing
    brakeman
    rails_best_practices
    rubocop
  end
end

# Share the active-record connection between rake_test and webkit
class ActiveRecord::Base
  mattr_accessor :shared_connection
  @@shared_connection = nil

  def self.connection
    @@shared_connection || retrieve_connection
  end
end
ActiveRecord::Base.shared_connection = ActiveRecord::Base.connection

DatabaseCleaner.strategy = :transaction

class ActionController::TestCase
  include Devise::TestHelpers
end

class ActiveSupport::TestCase
  ActiveRecord::Migration.check_pending!

  require 'enumerize/integrations/rspec'
  extend Enumerize::Integrations::RSpec

  fixtures :all

  before :each do
    DatabaseCleaner.start
  end

  after :each do
    DatabaseCleaner.clean
    $suite_passing = false if failure
  end

  # Add more helper methods to be used by all tests here...
end

class MiniTest::Spec
  before :each do
    DatabaseCleaner.start
  end

  after :each do
    DatabaseCleaner.clean

    $suite_passing = false if failure
  end

  # Add more helper methods to be used by all tests here...
end

class AcceptanceTest < MiniTest::Capybara::Spec
  include MiniTest::Metadata

  before :each do
    if metadata[:js] == true
      Capybara.current_driver = Capybara.javascript_driver
    end
  end

  after :each do
    Capybara.current_driver = Capybara.default_driver

    $suite_passing = false if failure
  end

  around do |tests|
    DatabaseCleaner.cleaning(&tests)
  end

  # Add more helper methods to be used by all tests here...
end

$suite_passing = true
