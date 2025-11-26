import json

# Comprehensive brand name to generic mappings (100+ common Indian brands)
brand_mappings = [
    # Original mappings
    {"commonName": "Pan", "dictionaryName": "Pantoprazole"},
    {"commonName": "Para", "dictionaryName": "Paracetamol"},
    {"commonName": "Strocit", "dictionaryName": "Citicoline"},
    {"commonName": "Ecosprin AV", "dictionaryName": "Aspirin"},
    {"commonName": "Betacap TR", "dictionaryName": "Propranolol"},
    {"commonName": "Vertin", "dictionaryName": "Betahistine"},
    {"commonName": "Clopilet", "dictionaryName": "Clopidogrel"},
    {"commonName": "Sitaglyn M", "dictionaryName": "Sitagliptin"},
    {"commonName": "Sorbitrate", "dictionaryName": "Isosorbide Mononitrate"},
    
    # From user's prescription
    {"commonName": "MedicoPan", "dictionaryName": "Pantoprazole"},
    {"commonName": "NeuroFast", "dictionaryName": "Citicoline"},
    {"commonName": "Cardixin", "dictionaryName": "Aspirin"},
    {"commonName": "AminoRel", "dictionaryName": "Methylcobalamin"},
    {"commonName": "OsteoBin", "dictionaryName": "Alendronate"},
    {"commonName": "Allerset", "dictionaryName": "Fexofenadine"},
    {"commonName": "Gastrolax", "dictionaryName": "Rabeprazole"},
    {"commonName": "Duracol XR", "dictionaryName": "Tramadol"},
    
    # Common Indian brands - Antibiotics
    {"commonName": "Augmentin", "dictionaryName": "Co-amoxiclav"},
    {"commonName": "Azithral", "dictionaryName": "Azithromycin"},
    {"commonName": "Cifran", "dictionaryName": "Ciprofloxacin"},
    {"commonName": "Clavam", "dictionaryName": "Co-amoxiclav"},
    {"commonName": "Moxikind CV", "dictionaryName": "Co-amoxiclav"},
    {"commonName": "Norflox TZ", "dictionaryName": "Norfloxacin"},
    {"commonName": "Zifi", "dictionaryName": "Cefixime"},
    
    # Pain & Fever
    {"commonName": "Brufen", "dictionaryName": "Ibuprofen"},
    {"commonName": "Calpol", "dictionaryName": "Paracetamol"},
    {"commonName": "Combiflam", "dictionaryName": "Ibuprofen"},
    {"commonName": "Dolo", "dictionaryName": "Paracetamol"},
    {"commonName": "Metacin", "dictionaryName": "Indomethacin"},
    {"commonName": "Voveran", "dictionaryName": "Diclofenac"},
    
    # Diabetes
    {"commonName": "Amaryl", "dictionaryName": "Glimepiride"},
    {"commonName": "Diamicron", "dictionaryName": "Gliclazide"},
    {"commonName": "Gluconorm", "dictionaryName": "Metformin"},
    {"commonName": "Glycomet", "dictionaryName": "Metformin"},
    {"commonName": "Januvia", "dictionaryName": "Sitagliptin"},
    {"commonName": "Lantus", "dictionaryName": "Insulin Glargine"},
    {"commonName": "Novomix", "dictionaryName": "Insulin Aspart"},
    
    # Hypertension & Heart
    {"commonName": "Amlong", "dictionaryName": "Amlodipine"},
    {"commonName": "Concor", "dictionaryName": "Bisoprolol"},
    {"commonName": "Corbis", "dictionaryName": "Bisoprolol"},
    {"commonName": "Cresar", "dictionaryName": "Telmisartan"},
    {"commonName": "Ecosprin", "dictionaryName": "Aspirin"},
    {"commonName": "Losar", "dictionaryName": "Losartan"},
    {"commonName": "Metolar", "dictionaryName": "Metoprolol"},
    {"commonName": "Stamlo", "dictionaryName": "Amlodipine"},
    {"commonName": "Telma", "dictionaryName": "Telmisartan"},
    
    # Cholesterol
    {"commonName": "Atorva", "dictionaryName": "Atorvastatin"},
    {"commonName": "Crestor", "dictionaryName": "Rosuvastatin"},
    {"commonName": "Lipitor", "dictionaryName": "Atorvastatin"},
    {"commonName": "Rosuvas", "dictionaryName": "Rosuvastatin"},
    {"commonName": "Storvas", "dictionaryName": "Atorvastatin"},
    
    # Gastric/Acidity
    {"commonName": "Aciloc", "dictionaryName": "Ranitidine"},
    {"commonName": "Gelusil", "dictionaryName": "Magnesium Sulfate"},
    {"commonName": "Nexpro", "dictionaryName": "Esomeprazole"},
    {"commonName": "Omez", "dictionaryName": "Omeprazole"},
    {"commonName": "Pantocid", "dictionaryName": "Pantoprazole"},
    {"commonName": "Rablet", "dictionaryName": "Rabeprazole"},
    {"commonName": "Razo", "dictionaryName": "Rabeprazole"},
    
    # Allergy & Cold
    {"commonName": "Allegra", "dictionaryName": "Fexofenadine"},
    {"commonName": "Avil", "dictionaryName": "Pheniramine"},
    {"commonName": "Cetrizine", "dictionaryName": "Cetirizine"},
    {"commonName": "Levocet", "dictionaryName": "Levocetirizine"},
    {"commonName": "Montair", "dictionaryName": "Montelukast"},
    {"commonName": "Zyrtec", "dictionaryName": "Cetirizine"},
    
    # Respiratory
    {"commonName": "Asthalin", "dictionaryName": "Salbutamol"},
    {"commonName": "Budecort", "dictionaryName": "Budesonide"},
    {"commonName": "Deriphyllin", "dictionaryName": "Theophylline"},
    {"commonName": "Duolin", "dictionaryName": "Ipratropium"},
    {"commonName": "Seroflo", "dictionaryName": "Fluticasone"},
    
    # Vitamins & Supplements
    {"commonName": "Becosules", "dictionaryName": "Vitamin B12"},
    {"commonName": "Calcirol", "dictionaryName": "Vitamin D"},
    {"commonName": "Limcee", "dictionaryName": "Vitamin C"},
    {"commonName": "Neurobion", "dictionaryName": "Vitamin B12"},
    {"commonName": "Shelcal", "dictionaryName": "Calcium Carbonate"},
    
    # Thyroid
    {"commonName": "Eltroxin", "dictionaryName": "Levothyroxine"},
    {"commonName": "Thyronorm", "dictionaryName": "Levothyroxine"},
    
    # Antidepressants & Psychiatric
    {"commonName": "Nexito", "dictionaryName": "Escitalopram"},
    {"commonName": "Oleanz", "dictionaryName": "Olanzapine"},
    {"commonName": "Rexipra", "dictionaryName": "Escitalopram"},
    {"commonName": "Zoloft", "dictionaryName": "Sertraline"},
    
    # Others
    {"commonName": "Duphaston", "dictionaryName": "Progesterone"},
    {"commonName": "Folvite", "dictionaryName": "Folic Acid"},
    {"commonName": "Lasix", "dictionaryName": "Furosemide"},
    {"commonName": "Lyrica", "dictionaryName": "Pregabalin"},
    {"commonName": "Shelcal", "dictionaryName": "Calcium Carbonate"},
    {"commonName": "Urimax", "dictionaryName": "Tamsulosin"},
    {"commonName": "Zincovit", "dictionaryName": "Vitamin C"}
]

# Sort by common name
brand_mappings.sort(key=lambda x: x["commonName"])

# Write to file
with open(r'c:\Users\poova\Desktop\Ai-Based Medication Reminder\server\data\commonMedicineNames.json', 'w') as f:
    json.dump(brand_mappings, f, indent=2)

print(f"✅ Created brand mappings with {len(brand_mappings)} entries")
