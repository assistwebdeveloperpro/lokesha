const service = require("./popular-projects.service");
const { handleError } = require("../../../shared/property/controllers/property.controller");

async function searchProjects(req, res) {
  try {
    return res.status(200).json(await service.searchProjects(req.validatedQuery));
  } catch (error) {
    return handleError(res, error);
  }
}

async function listEntries(req, res) {
  try {
    return res.status(200).json(await service.listEntries());
  } catch (error) {
    return handleError(res, error);
  }
}

async function addProjects(req, res) {
  try {
    return res.status(201).json(await service.addProjects(req.body.projectIds));
  } catch (error) {
    return handleError(res, error);
  }
}

async function removeProject(req, res) {
  try {
    await service.removeProject(req.params.projectId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

async function saveOrder(req, res) {
  try {
    await service.saveOrder(req.body.projectIds);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { searchProjects, listEntries, addProjects, removeProject, saveOrder };
