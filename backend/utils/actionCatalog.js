const { IMPACT_METRICS } = require("./actionTaxonomy");

const ACTION_CATALOG = {
    playas: {
        title: "Juntar basura en playas",
        description: "Juntar elementos como vidrios, plásticos y cartón para limpiar las playas.",
        pointsPerUnit: 10,
        impactMetric: "residuos",
        image: "/assets/img/people recycling.webp",
        imageAlt: "Personas recogiendo basura en la playa",
        order: 1
    },
    "separar-basura": {
        title: "Separar basura en casa.",
        description: "Separar basura orgánica de elementos plásticos o vidrios.",
        pointsPerUnit: 5,
        impactMetric: "residuos",
        image: "/assets/img/Separar basura en casa.jpg",
        imageAlt: "Dos personas separando la basura en casa",
        order: 2
    },
    compostar: {
        title: "Compostar",
        description: "Compostar elementos orgánicos para evitar su desperdicio y reutilizarlos.",
        pointsPerUnit: 5,
        impactMetric: "residuos",
        image: "/assets/img/Compostando.jpg",
        imageAlt: "Madre e hija compostando",
        order: 3
    },
    "plantar-arboles": {
        title: "Plantar árboles nativos",
        description: "Plantar árboles para reducir la pérdida de especies nativas que afectan al ecosistema.",
        pointsPerUnit: 20,
        impactMetric: "arboles",
        image: "/assets/img/Plantar arboles.jpg",
        imageAlt: "Familia plantando un árbol",
        order: 4
    },
    electronicos: {
        title: "Entregar aparatos electrónicos que ya no se usan",
        description: "Entregar dispositivos electrónicos para darles una segunda vida.",
        pointsPerUnit: 15,
        impactMetric: "electronicos",
        image: "/assets/img/Reutilizar electronicos.jpg",
        imageAlt: "Hombre soldando componentes electrónicos",
        order: 5
    },
    energia: {
        title: "Reducir el consumo energético",
        description: "Aplicar prácticas para reducir el consumo energético y así ahorrar energía.",
        pointsPerUnit: 2,
        impactMetric: "energia",
        image: "/assets/img/Reducir el consumo energetico.jpg",
        imageAlt: "Mujer desenchufando un cable",
        order: 6
    }
};

const migrateActionTaxonomy = async (Action) => {
    const actions = await Action.collection.find({}).toArray();

    for (const action of actions) {
        const defaults = ACTION_CATALOG[action.key];
        const set = {};
        const unset = {};

        if (action.pointsPerUnit === undefined) {
            set.pointsPerUnit = defaults?.pointsPerUnit ?? action.points ?? 0;
        }

        if (!IMPACT_METRICS[action.impactMetric]) {
            set.impactMetric = defaults?.impactMetric || "acciones";
        }

        if (action.points !== undefined) {
            unset.points = "";
        }

        if (Object.keys(set).length || Object.keys(unset).length) {
            await Action.collection.updateOne(
                { _id: action._id },
                {
                    ...(Object.keys(set).length ? { $set: set } : {}),
                    ...(Object.keys(unset).length ? { $unset: unset } : {})
                }
            );
        }
    }
};

module.exports = { ACTION_CATALOG, migrateActionTaxonomy };
