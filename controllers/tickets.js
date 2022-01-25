const getTicketsByProject = (req, res) => {
  const { projectId } = req.params;
  db.select([
    "id",
    "title",
    "description",
    "created_by",
    "assigned_to",
    "priority",
    "status",
    "project_id",
  ])
    .from("tickets")
    .where({ project_id: projectId })
    .then((tickets) => {
      res.status(200).json(tickets);
    })
    .catch((err) => res.status(400).json("Error getting tickets."));
};

module.exports = {
  getTicketsByProject,
};
