# frozen_string_literal: true
class Division::MarkAsDone < Trailblazer::Operation
  # Expected options: divison, last_acting_user
  step :mark_as_done_and_assign_system!
  step :set_organization_to_all_done_when_this_is_the_last_divison

  private

  def mark_as_done_and_assign_system!(_, divison:, last_acting_user:, **)
    if divison.done == false
      divison.update_columns done: true
      ::Assignment::CreateBySystem.(
        {}, assignable: divison, last_acting_user: last_acting_user
      ).success?
    end
    true
  end

  def set_organization_to_all_done_when_this_is_the_last_divison(
    _, divison:, last_acting_user:, **
  )
    # TODO: do this as a side-effect in Organization::ChangeState
    if divison.organization.divisions.where(done: false).empty? &&
       divison.organization.approved?
      divison.organization.mark_as_done # trigger event for callbacks
      ::Assignment::CreateBySystem.(
        {}, assignable: divison.organization, last_acting_user: last_acting_user
      ).success?
    end
    true
  end
end