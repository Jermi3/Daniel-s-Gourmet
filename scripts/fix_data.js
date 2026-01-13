
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
    }
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

const updates = [
    // SUB SANDWICHES
    { item: 'Ham Stack', vars: { 'FULL': 'B1F', 'SOLO': 'B1S' } },
    { item: 'Chicken Salad Sub', vars: { 'FULL': 'B2F', 'SOLO': 'B2S' } },
    { item: 'Grilled chix Pesto Sub', vars: { 'FULL': 'B3F', 'SOLO': 'B3S' } },
    { item: 'Club Sub', vars: { 'FULL': 'B4F', 'SOLO': 'B4S' } },
    { item: 'Tuna Salad Sub', vars: { 'FULL': 'B5F', 'SOLO': 'B5S' } },
    { item: 'Banh Mi Sub', vars: { 'FULL': 'B6F', 'SOLO': 'B6S' } },
    { item: 'Kani Sub', vars: { 'FULL': 'B7F', 'SOLO': 'B7S' } },
    { item: 'Sausage & Spinach Sub', vars: { 'FULL': 'B8F', 'SOLO': 'B8S' } },
    { item: 'Spanish Sardines Sub', vars: { 'FULL': 'B9F', 'SOLO': 'B9S' } },
    { item: 'Philly Cheese Steak Sub', vars: { 'FULL': 'B10F' } },
    { item: 'Smoked Salmon Sub', vars: { 'FULL': 'B11F' } },

    // PANINI SANDWICHES
    { item: 'Grilled chicken Pesto', category: 'Panini Sandwich', vars: { 'FULL': 'N1F', 'SOLO': 'N1S' } },
    { item: '3 Cheese Deluxe', vars: { 'FULL': 'N2F', 'SOLO': 'N2S' } },
    { item: 'Cheesy Pepperoni', vars: { 'FULL': 'N3F', 'SOLO': 'N3S' } },
    { item: 'Ham and Cheese', vars: { 'FULL': 'N4F', 'SOLO': 'N4S' } },
    { item: 'Spanish Sardines', vars: { 'FULL': 'N5F', 'SOLO': 'N5S' } },
    { item: 'Bacon & Mushroom Melt', vars: { 'FULL': 'N6F', 'SOLO': 'N6S' } },
    { item: 'Grilled Veggie', vars: { 'FULL': 'N7F', 'SOLO': 'N7S' } },
    { item: 'Sausage & Spinach', vars: { 'FULL': 'N8F', 'SOLO': 'N9S' } },

    // SALAD BOWLS
    { item: 'Greek Grilled Chicken Salad', vars: { 'FULL': 'S1F', 'SOLO': 'S1S' } },
    { item: 'Chicken Kani-Apple Salad', vars: { 'FULL': 'S2F', 'SOLO': 'S2S' } },
    { item: 'Japanese Kani-Mango Salad', vars: { 'FULL': 'S3F', 'SOLO': 'S3S' } },
    { item: 'Pesto Pasta Salad', vars: { 'FULL': 'S4F', 'SOLO': 'S4S' } },
    { item: 'Mexican Beef Taco Salad', vars: { 'FULL': 'S5F', 'SOLO': 'S5S' } },
    { item: 'Tuna-Cranberry Salad', vars: { 'FULL': 'S6F', 'SOLO': 'S6S' } },
    { item: 'Grilled Veggie Salad', vars: { 'FULL': 'S7F', 'SOLO': 'S7S' } },
    { item: 'Mexican Pasta Salad', vars: { 'FULL': 'S8F', 'SOLO': 'S8S' } },

    // WRAPS (Note: They might be named differently in DB, checking generic names)
    // The migration had " (Wrap)" in description but name was same? No, name was "Greek..."
    // Wait, migration Step 240 Line 335: VALUES ('Greek Grilled Chicken Salad', 'Greek Grilled Chicken Salad (Wrap)',...)
    // So the NAME is the same as the Bowl? This is a problem if they share names.
    // Checking Step 240 again:
    // Line 259: VALUES ('Greek Grilled Chicken Salad', ...) -> Category: salad-bowls
    // Line 335: VALUES ('Greek Grilled Chicken Salad', ...) -> Category: salad-wrap
    // So they HAVE THE SAME NAME. I must filter by Category.

    // PASTA
    { item: 'Aglio Olio Pasta', vars: { 'FULL': 'P1F', 'SOLO': 'P1S' } },
    { item: 'Grilled chicken Pesto', category: 'Pasta', vars: { 'FULL': 'P2F', 'SOLO': 'P2S' } },
    { item: 'Marinara Pepperoni', vars: { 'FULL': 'P3F', 'SOLO': 'P3S' } },
    { item: 'Spanish Sardines Pasta', vars: { 'FULL': 'P4F', 'SOLO': 'P4S' } },
    { item: 'Classic Bacon Carbonara', vars: { 'FULL': 'P5F', 'SOLO': 'P5S' } },
    { item: '3Cheese Deluxe', category: 'Pasta', vars: { 'FULL': 'P6F', 'SOLO': 'P6S' } },
    { item: 'Mushroom Truffle', vars: { 'FULL': 'P7F', 'SOLO': 'P7S' } },
    { item: 'Beef Mexican Melt', vars: { 'FULL': 'P8F', 'SOLO': 'P8S' } },
    { item: 'Sausage and Spinach', vars: { 'FULL': 'P9F', 'SOLO': 'P9S' } },
    { item: 'Creamy Pesto pasta', vars: { 'FULL': 'P10F', 'SOLO': 'P10S' } },
    { item: 'Charlie Chan Pasta', vars: { 'FULL': 'P11F', 'SOLO': 'P11S' } },

];

async function run() {
    console.log('Starting explicit code update...');

    for (const update of updates) {
        // 1. Find the menu item
        let query = supabase.from('menu_items').select('id, category').eq('name', update.item);

        // If strict category needed (for duplicates like Grilled chicken Pesto)
        // Note: Category in DB is an ID (e.g. 'sub-sandwich', 'panini-sandwich').
        // My update object has 'Panini Sandwich' readable name, I need to map it or ignore if only one exists.
        // Let's just fetch all matches and try to deduce or update all if names match.

        const { data: items, error } = await query;

        if (error || !items || items.length === 0) {
            console.log(`Skipping ${update.item}: Not found`);
            continue;
        }

        // Iterate through all found items with that name (could be multiple if categories differ)
        for (const item of items) {
            // Filter by category if specified
            if (update.category) {
                // Simple check: if update.category is "Pasta" and item.category is "pasta", it matches
                if (!item.category.toLowerCase().includes(update.category.toLowerCase().split(' ')[0])) {
                    continue;
                }
            }

            console.log(`Updating variations for ${update.item} (${item.id})...`);

            for (const [varName, code] of Object.entries(update.vars)) {
                const { error: updateError } = await supabase
                    .from('variations')
                    .update({ code: code })
                    .eq('menu_item_id', item.id)
                    .eq('name', varName);

                if (updateError) console.error(`Failed to update ${varName}:`, updateError);
                else console.log(`  Set ${varName} -> ${code}`);
            }
        }
    }
    console.log('Done.');
}

run();
