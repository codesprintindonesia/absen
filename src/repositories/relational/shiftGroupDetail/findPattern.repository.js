// src/repositories/relational/shiftGroupDetail/findPattern.repository.js

import { ShiftGroupDetail } from "../../../models/relational/shiftGroupDetail.model.js";
import { Op } from "sequelize";

const findPattern = async (idShiftGroup, options = {}) => {
  return await ShiftGroupDetail.findAll({
    where: {
      id_shift_group: idShiftGroup,
      urutan_hari_siklus: {
        [Op.not]: null,
      },
    },
    order: [['urutan_hari_siklus', 'ASC']],
    raw: true,
    ...options,
  });
};

export default findPattern;