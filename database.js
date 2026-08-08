/* =========================================================
   AutoInspect AI
   database.js
   Vehicle Database + Search + Filters
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectDatabase = (() => {

    /* =====================================================
       DATABASE
    ===================================================== */

    const VEHICLES = [

        {
            id: "toyota-corolla",
            brand: "Toyota",
            model: "Corolla",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "CVT", "Manual"]
        },

        {
            id: "toyota-camry",
            brand: "Toyota",
            model: "Camry",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "CVT"]
        },

        {
            id: "toyota-land-cruiser",
            brand: "Toyota",
            model: "Land Cruiser",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "toyota-rav4",
            brand: "Toyota",
            model: "RAV4",
            years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic", "CVT"]
        },

        {
            id: "honda-civic",
            brand: "Honda",
            model: "Civic",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan", "Hatchback"],
            transmission: ["Automatic", "CVT", "Manual"]
        },

        {
            id: "honda-accord",
            brand: "Honda",
            model: "Accord",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "CVT"]
        },

        {
            id: "honda-crv",
            brand: "Honda",
            model: "CR-V",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic", "CVT"]
        },

        {
            id: "nissan-altima",
            brand: "Nissan",
            model: "Altima",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline"],
            body: ["Sedan"],
            transmission: ["CVT"]
        },

        {
            id: "nissan-patrol",
            brand: "Nissan",
            model: "Patrol",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "nissan-xtrail",
            brand: "Nissan",
            model: "X-Trail",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["SUV"],
            transmission: ["CVT", "Automatic"]
        },

        {
            id: "hyundai-elantra",
            brand: "Hyundai",
            model: "Elantra",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "CVT", "Manual"]
        },

        {
            id: "hyundai-sonata",
            brand: "Hyundai",
            model: "Sonata",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "hyundai-tucson",
            brand: "Hyundai",
            model: "Tucson",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid", "Diesel"],
            body: ["SUV"],
            transmission: ["Automatic", "DCT"]
        },

        {
            id: "kia-sportage",
            brand: "Kia",
            model: "Sportage",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid", "Diesel"],
            body: ["SUV"],
            transmission: ["Automatic", "DCT"]
        },

        {
            id: "kia-k5",
            brand: "Kia",
            model: "K5",
            years: [2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "ford-f150",
            brand: "Ford",
            model: "F-150",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Pickup"],
            transmission: ["Automatic"]
        },

        {
            id: "ford-explorer",
            brand: "Ford",
            model: "Explorer",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "chevrolet-tahoe",
            brand: "Chevrolet",
            model: "Tahoe",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "chevrolet-silverado",
            brand: "Chevrolet",
            model: "Silverado",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel"],
            body: ["Pickup"],
            transmission: ["Automatic"]
        },

        {
            id: "bmw-3-series",
            brand: "BMW",
            model: "3 Series",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "Manual"]
        },

        {
            id: "bmw-5-series",
            brand: "BMW",
            model: "5 Series",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "mercedes-c-class",
            brand: "Mercedes-Benz",
            model: "C-Class",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "mercedes-e-class",
            brand: "Mercedes-Benz",
            model: "E-Class",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "mercedes-glc",
            brand: "Mercedes-Benz",
            model: "GLC",
            years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "audi-a4",
            brand: "Audi",
            model: "A4",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic", "Manual"]
        },

        {
            id: "audi-q5",
            brand: "Audi",
            model: "Q5",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "lexus-rx",
            brand: "Lexus",
            model: "RX",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic"]
        },

        {
            id: "lexus-es",
            brand: "Lexus",
            model: "ES",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Hybrid"],
            body: ["Sedan"],
            transmission: ["Automatic"]
        },

        {
            id: "volkswagen-golf",
            brand: "Volkswagen",
            model: "Golf",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["Hatchback"],
            transmission: ["Automatic", "Manual"]
        },

        {
            id: "volkswagen-tiguan",
            brand: "Volkswagen",
            model: "Tiguan",
            years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
            fuel: ["Gasoline", "Diesel", "Hybrid"],
            body: ["SUV"],
            transmission: ["Automatic", "Manual"]
        }

    ];


    /* =====================================================
       ENGINE TYPES
    ===================================================== */

    const ENGINE_TYPES = [

        "Petrol",
        "Diesel",
        "Hybrid",
        "Plug-in Hybrid",
        "Electric"

    ];


    /* =====================================================
       BODY TYPES
    ===================================================== */

    const BODY_TYPES = [

        "Sedan",
        "SUV",
        "Hatchback",
        "Pickup",
        "Coupe",
        "Convertible",
        "Van",
        "Wagon"

    ];


    /* =====================================================
       GET ALL
    ===================================================== */

    function getAllVehicles() {

        return VEHICLES.map(
            vehicle =>
                structuredCloneSafe(
                    vehicle
                )
        );
    }


    /* =====================================================
       GET BRANDS
    ===================================================== */

    function getBrands() {

        return [
            ...new Set(
                VEHICLES.map(
                    vehicle =>
                        vehicle.brand
                )
            )
        ].sort();
    }


    /* =====================================================
       GET MODELS
    ===================================================== */

    function getModels(
        brand
    ) {

        if (!brand) {

            return [];
        }

        return [
            ...new Set(

                VEHICLES

                    .filter(
                        vehicle =>
                            normalize(
                                vehicle.brand
                            ) ===
                            normalize(
                                brand
                            )
                    )

                    .map(
                        vehicle =>
                            vehicle.model
                    )
            )
        ].sort();
    }


    /* =====================================================
       GET YEARS
    ===================================================== */

    function getYears(
        brand,
        model
    ) {

        const records =
            VEHICLES.filter(
                vehicle => {

                    const brandMatch =
                        !brand ||
                        normalize(
                            vehicle.brand
                        ) ===
                        normalize(
                            brand
                        );

                    const modelMatch =
                        !model ||
                        normalize(
                            vehicle.model
                        ) ===
                        normalize(
                            model
                        );

                    return (
                        brandMatch &&
                        modelMatch
                    );
                }
            );


        const years =
            records.flatMap(
                vehicle =>
                    vehicle.years
            );


        return [
            ...new Set(
                years
            )
        ].sort(
            (a, b) =>
                a - b
        );
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function search(
        query
    ) {

        const q =
            normalize(
                query
            );

        if (!q) {

            return getAllVehicles();
        }

        return VEHICLES.filter(
            vehicle => {

                const text =
                    normalize(
                        [
                            vehicle.brand,
                            vehicle.model,
                            vehicle.id
                        ].join(
                            " "
                        )
                    );

                return text.includes(
                    q
                );
            }
        );
    }


    /* =====================================================
       FIND VEHICLE
    ===================================================== */

    function findVehicle(
        brand,
        model,
        year
    ) {

        return VEHICLES.find(
            vehicle => {

                const brandMatch =
                    !brand ||
                    normalize(
                        vehicle.brand
                    ) ===
                    normalize(
                        brand
                    );

                const modelMatch =
                    !model ||
                    normalize(
                        vehicle.model
                    ) ===
                    normalize(
                        model
                    );

                const yearMatch =
                    !year ||
                    vehicle.years.includes(
                        Number(year)
                    );

                return (
                    brandMatch &&
                    modelMatch &&
                    yearMatch
                );
            }
        ) || null;
    }


    /* =====================================================
       FILTER
    ===================================================== */

    function filter(
        options = {}
    ) {

        const {
            brand,
            model,
            year,
            fuel,
            body,
            transmission
        } = options;


        return VEHICLES.filter(
            vehicle => {

                if (
                    brand &&
                    normalize(
                        vehicle.brand
                    ) !==
                    normalize(
                        brand
                    )
                ) {

                    return false;
                }


                if (
                    model &&
                    normalize(
                        vehicle.model
                    ) !==
                    normalize(
                        model
                    )
                ) {

                    return false;
                }


                if (
                    year &&
                    !vehicle.years.includes(
                        Number(year)
                    )
                ) {

                    return false;
                }


                if (
                    fuel &&
                    !vehicle.fuel.includes(
                        fuel
                    )
                ) {

                    return false;
                }


                if (
                    body &&
                    !vehicle.body.includes(
                        body
                    )
                ) {

                    return false;
                }


                if (
                    transmission &&
                    !vehicle.transmission.includes(
                        transmission
                    )
                ) {

                    return false;
                }


                return true;
            }
        );
    }


    /* =====================================================
       POPULATE SELECT
    ===================================================== */

    function populateSelect(
        selector,
        values,
        placeholder
    ) {

        const select =
            typeof selector ===
            "string"
                ? document.querySelector(
                    selector
                )
                : selector;

        if (!select) {

            return;
        }

        select.innerHTML = "";

        const first =
            document.createElement(
                "option"
            );

        first.value =
            "";

        first.textContent =
            placeholder ||
            "اختر";

        select.appendChild(
            first
        );


        values.forEach(
            value => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    value;

                option.textContent =
                    value;

                select.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       CONNECT VEHICLE SELECTORS
    ===================================================== */

    function setupSelectors(
        options = {}
    ) {

        const brandSelector =
            options.brand ||
            "#vehicleBrand";

        const modelSelector =
            options.model ||
            "#vehicleModel";

        const yearSelector =
            options.year ||
            "#vehicleYear";


        const brand =
            document.querySelector(
                brandSelector
            );

        const model =
            document.querySelector(
                modelSelector
            );

        const year =
            document.querySelector(
                yearSelector
            );


        if (!brand) {

            return;
        }


        populateSelect(
            brand,
            getBrands(),
            "اختر الشركة"
        );


        brand.addEventListener(
            "change",
            () => {

                const models =
                    getModels(
                        brand.value
                    );

                if (model) {

                    populateSelect(
                        model,
                        models,
                        "اختر الموديل"
                    );
                }

                if (year) {

                    populateSelect(
                        year,
                        [],
                        "اختر السنة"
                    );
                }
            }
        );


        if (model) {

            model.addEventListener(
                "change",
                () => {

                    const years =
                        getYears(
                            brand.value,
                            model.value
                        );

                    if (year) {

                        populateSelect(
                            year,
                            years,
                            "اختر السنة"
                        );
                    }
                }
            );
        }
    }


    /* =====================================================
       VEHICLE SUMMARY
    ===================================================== */

    function getVehicleSummary(
        brand,
        model,
        year
    ) {

        const vehicle =
            findVehicle(
                brand,
                model,
                year
            );

        if (!vehicle) {

            return null;
        }


        return {

            id:
                vehicle.id,

            brand:
                vehicle.brand,

            model:
                vehicle.model,

            year:
                Number(year),

            fuel:
                vehicle.fuel,

            body:
                vehicle.body,

            transmission:
                vehicle.transmission

        };
    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalize(
        value
    ) {

        return String(
            value || ""
        )
            .toLowerCase()
            .trim();
    }


    /* =====================================================
       SAFE CLONE
    ===================================================== */

    function structuredCloneSafe(
        object
    ) {

        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                object
            );
        }

        return JSON.parse(
            JSON.stringify(
                object
            )
        );
    }


    /* =====================================================
       DATABASE STATS
    ===================================================== */

    function stats() {

        const brands =
            getBrands();

        const models =
            [
                ...new Set(
                    VEHICLES.map(
                        vehicle =>
                            vehicle.model
                    )
                )
            ];

        const years =
            [
                ...new Set(
                    VEHICLES.flatMap(
                        vehicle =>
                            vehicle.years
                    )
                )
            ];

        return {

            vehicles:
                VEHICLES.length,

            brands:
                brands.length,

            models:
                models.length,

            years:
                years.length

        };
    }


    /* =====================================================
       EXPORT DATABASE
    ===================================================== */

    function exportJSON() {

        return JSON.stringify(
            {
                version:
                    "1.0.0",

                generated:
                    new Date()
                        .toISOString(),

                vehicles:
                    VEHICLES
            },
            null,
            2
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        init,

        getAllVehicles,

        getBrands,

        getModels,

        getYears,

        search,

        findVehicle,

        filter,

        populateSelect,

        setupSelectors,

        getVehicleSummary,

        stats,

        exportJSON,

        engineTypes:
            () =>
                [...ENGINE_TYPES],

        bodyTypes:
            () =>
                [...BODY_TYPES]

    };


    return api;

})();


/* =========================================================
   INIT
========================================================= */

function initDatabase() {

    window.AutoInspectAI.database =
        AutoInspectDatabase;

    console.log(
        "AutoInspect AI Database loaded:",
        AutoInspectDatabase.stats()
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initDatabase
    );

} else {

    initDatabase();

}


window.AutoInspectDatabase =
    AutoInspectDatabase;
