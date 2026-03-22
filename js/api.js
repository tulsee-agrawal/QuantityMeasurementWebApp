const BASE_URL = "http://localhost:3000";

export async function getUnits(type) {
    try {
        const res = await fetch(`${BASE_URL}/units?type=${type}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }   

        return await res.json();
    } catch (error) {
        console.error("Error fetching units:", error);
        return [];
    }
}

export async function getUnits(type) {
    try {
        const res = await fetch(`${BASE_URL}/units?type=${type}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching units:", error);
        return [];
    }
}

export async function getConversion(from, to) {

    const res = await fetch(`${BASE_URL}/conversions?from=${from}&to=${to}`);

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();   

    if (!data.length) {
        throw new Error("No conversion found");
    }

    return data[0];   
}