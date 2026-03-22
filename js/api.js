const BASE_URL = "http://localhost:3000";

export async function getUnits(type) {
    try {
        const res = await fetch(`${BASE_URL}/units?type=${type}`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return [];
    }
}

export async function getConversion(from, to) {
    const res = await fetch(
        `${BASE_URL}/conversions?from=${from}&to=${to}`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();
    if (!data.length) throw new Error("No conversion");

    return data[0];
}

export async function saveHistory(record) {
    await fetch(`${BASE_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    });
}

export async function getHistory() {
    try {
        const res = await fetch(
            `${BASE_URL}/history?_sort=timestamp&_order=desc`
        );
        return await res.json();
    } catch {
        return [];
    }
}
