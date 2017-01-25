# frozen_string_literal: true
module API::V1
  module Location
    class Index < API::V1::Default::Index
      def model!(params)
        ::Location
          .where('LOWER(display_name) LIKE LOWER(?)', "%#{params[:query]}%")
      end
    end
  end
end
