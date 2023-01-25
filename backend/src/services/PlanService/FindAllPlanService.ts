import Plan from "../../models/Plan";

const FindAllPlanService = async (): Promise<Plan[]> => {
  const plans = await Plan.findAll({
    order: [["name", "ASC"]]
  });
  return plans;
};

export default FindAllPlanService;
