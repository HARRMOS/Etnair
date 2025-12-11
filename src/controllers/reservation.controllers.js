/* --- CREATE --- */
export const createReservation = async (req, res) => {
  const { arrivalDate, departureDate, GuestNb, TotalCost, Status, annoncesId } =
    req.body;

  // Utiliser l'ID de l'utilisateur connecté
  const UserId = req.user?.id || req.userId;
  // Validation des champs requis
  if (
    !arrivalDate ||
    !departureDate ||
    !GuestNb ||
    !TotalCost ||
    !Status ||
    !annoncesId
  ) {
    return res.status(400).json({
      error:
        "Champs manquants : arrivalDate, departureDate, GuestNb, TotalCost, Status et annoncesId sont requis",
    });
  }
  if (!UserId) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  // Validation des dates
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
    return res.status(400).json({ error: "Format de date invalide" });
  }
  if (arrival >= departure) {
    return res
      .status(400)
      .json({
        error: "La date d'arrivée doit être antérieure à la date de départ",
      });
  }
  if (arrival < new Date()) {
    return res
      .status(400)
      .json({ error: "La date d'arrivée ne peut pas être dans le passé" });
  }
  // Validation du nombre de guests
  if (GuestNb < 1) {
    return res
      .status(400)
      .json({ error: "Le nombre d'invités doit être au moins 1" });
  }
  // Validation du coût total
  if (TotalCost <= 0) {
    return res
      .status(400)
      .json({ error: "Le coût total doit être supérieur à 0" });
  }
  try {
    // Vérifier que l'annonce existe
    const annonce = await prisma.annonces.findUnique({
      where: { id: Number(annoncesId) },
    });
    if (!annonce) {
      return res.status(404).json({ error: "Annonce introuvable" });
    }
    // Vérifier que l'utilisateur existe
    const user = await prisma.users.findUnique({
      where: { id: Number(UserId) },
    });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    const newReservation = await prisma.reservations.create({
      data: {
        arrivalDate: arrival,
        departureDate: departure,
        GuestNb: Number(GuestNb),

        TotalCost: Number(TotalCost),
        Status,
        annoncesId: Number(annoncesId),
        UserId: Number(UserId),
      },
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
    });
    res.status(201).json(newReservation);
  } catch (error) {
    console.error("Erreur createReservation:", error);
    if (error.code === "P2003") {
      return res.status(400).json({ error: "annoncesId ou UserId invalide" });
    }
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
};
/* --- GET ALL --- */
export const getAllReservations = async (req, res) => {
  try {
    // Si admin, voir toutes les réservations, sinon seulement les siennes
    const where = {};
    if (!req.user?.isadmin) {
      where.UserId = req.user?.id || req.userId;
    }
    const reservations = await prisma.reservations.findMany({
      where,
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
      orderBy: {
        arrivalDate: "desc",
      },
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getAllReservations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- GET BY ID --- */
export const getReservationById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    const reservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
    });
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier que l'utilisateur peut voir cette réservation
    if (
      !req.user?.isadmin &&
      reservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Erreur getReservationById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- GET BY USER ID --- */
export const getReservationsByUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "userId invalide" });
  }
  // Vérifier que l'utilisateur peut voir ses propres réservations ou qu'il est admin
  if (!req.user?.isadmin && Number(userId) !== (req.user?.id || req.userId)) {
    return res.status(403).json({ error: "Accès interdit" });
  }
  try {
    const reservations = await prisma.reservations.findMany({
      where: { UserId: Number(userId) },
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
      orderBy: {
        arrivalDate: "desc",
      },
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getReservationsByUser:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- UPDATE --- */
export const updateReservation = async (req, res) => {
  const { id } = req.params;

  const { arrivalDate, departureDate, GuestNb, TotalCost, Status } = req.body;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
    });
    if (!existingReservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier les permissions
    if (
      !req.user?.isadmin &&
      existingReservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    const updateData = {};
    if (arrivalDate !== undefined) {
      const arrival = new Date(arrivalDate);
      if (isNaN(arrival.getTime())) {
        return res
          .status(400)
          .json({ error: "Format de date d'arrivée invalide" });
      }
      updateData.arrivalDate = arrival;
    }
    if (departureDate !== undefined) {
      const departure = new Date(departureDate);
      if (isNaN(departure.getTime())) {
        return res
          .status(400)
          .json({ error: "Format de date de départ invalide" });
      }
      updateData.departureDate = departure;
    }
    if (GuestNb !== undefined) {
      if (GuestNb < 1) {
        return res
          .status(400)
          .json({ error: "Le nombre d'invités doit être au moins 1" });
      }
      updateData.GuestNb = Number(GuestNb);
    }
    if (TotalCost !== undefined) {
      if (TotalCost <= 0) {
        return res
          .status(400)
          .json({ error: "Le coût total doit être supérieur à 0" });
      }
      updateData.TotalCost = Number(TotalCost);
    }
    if (Status !== undefined) {
      updateData.Status = Status;
    }
    const updatedReservation = await prisma.reservations.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
    });
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Erreur updateReservation:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};
/* --- DELETE --- */
export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
    });
    if (!existingReservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier les permissions
    if (
      !req.user?.isadmin &&
      existingReservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    await prisma.reservations.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteReservation:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
export default {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByUser,
  updateReservation,
  deleteReservation,
};
