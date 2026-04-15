export const typeOverrides = {
  'T3 Land Factory': ['ZEB9601'],
  'Direct Fire Experimental': ['XNL0401', 'UEL0401', 'UAL0401', 'XSL0401', 'URL0402', 'XNL0402', 'XRL0403'],
  'Air Experimental': ['URA0401', 'XRL0401', 'UAA0310', 'XSA0402', 'XNA0401'],
  'Naval Experimental': ['UES0401', 'UAS0401'],
  'Indirect Fire Experimental': ['UEB2401', 'XNL0403', 'URL0401', 'XSB2401', 'XAB2307'],
  'Other Experimental': ['XAB1401', 'XEA0002', 'XEB2402', 'XNB2302', 'XNO2302'],
  'T1 Light Air Transport': ['XNA0107'],
  'T2 Gunship': ['XNA0203'],
  'T3 Engineering Drone': ['UEA0003'],
  'T1 Bot/Tank': ['UEL0201', 'URL0107', 'UAL0201', 'XSL0201', 'XNL0201'],
  'T1 Land Scout': ['XSL0101'],
  'T1 Light Assault Bot': ['XNL0106'],
  'T1 Mobile Light Artillery': ['XNL0103'],
  'T2 Heavy Tank/Assault Bot': ['UEL0202', 'URL0202', 'UAL0202', 'XSL0202', 'XNL0202'],
  'T2 Bot': ['DRL0204', 'DEL0204'],
  'T2 Hover/Amphibious Tank': ['UEL0203', 'XAL0203', 'XSL0203', 'XNL0203', 'URL0203'],
  'T3 Heavy Assault Bot/Tank': ['XEL0305', 'XRL0305', 'UAL0303', 'XSL0303', 'XNL0305'],
  'T3 Assault Bot': ['UEL0303', 'URL0303', 'XNL0303'],
  'T1 Mobile Anti-Air': ['UEL0104', 'URL0104', 'UAL0104', 'XSL0104'],
  'T1 Anti-Air Turret': ['XSB2104'],
  'T2 Anti-Air Flak Artillery': ['XNB2202'],
  'T2 Mobile Anti-Air': ['URL0205', 'UAL0205', 'UEL0205', 'XSL0205', 'XNL0205'],
  'T3 Mobile Anti-Air': ['DELK002', 'DSLK004', 'DRLK001', 'DALK003', 'XNL0302'],
  'T1 Anti-Air Boat': ['UAS0102', 'XNS0102'],
  'T2 Submarine': ['XRS0204', 'XAS0204'],
  'T1 Air Staging Facility': ['XSB5202'],
  'T2 Torpedo Launcher': ['XNB2207'],
  'T3 Anti-Air SAM Launcher': ['XSB2304'],
  'T3 Omni Sensor Array': ['XSB3104'],
  'T2 Shield Generator': ['XNB4202'],
  'T3 Heavy Shield Generator': ['URB4207'],
  'T3 Heavy/Anti-Air Gunship': ['UEA0305', 'XRA0305', 'XAA0305', 'XNA0305'],
}

export const TypeById = Object.fromEntries(
  Object.entries(typeOverrides).flatMap(([type, ids]) => ids.map(id => [id, type]))
)

export const sectionByType = {
  'Construction - Buildpower': ['Engineer', 'Field Engineer', 'Support Armored Command Unit', 'Armored Command Unit', 'ACU Engineering Drone', 'Engineering Drone', 'Engineering Station', 'T3 Crab Egg (Engineer)'],
  'Land': ['Bot/Tank', 'Light Assault Bot', 'Mobile Light Artillery', 'Tank Destroyer', 'Mobile Anti-Air', 'Land Scout', 'Heavy Tank/Assault Bot', 'Hover/Amphibious Tank', 'EMP Tank', 'Bot', 'Mobile Missile Launcher', 'Mobile Shield Generator', 'Mobile Stealth Field System', 'Mobile Bomb', 'Heavy Assault Bot/Tank', 'Assault Bot', 'Sniper Bot', 'Mobile Heavy Artillery', 'Mobile Missile Platform', 'Mobile Anti-Air', 'Shield Disruptor', 'Crab Egg'],
  'Air': ['Interceptor', 'Attack Bomber', 'Light Gunship', 'Air Scout', 'Light Air Transport', 'Combat Fighter', 'Fighter/Bomber', 'Gunship', 'Torpedo Bomber', 'Guided Missile', 'Air Transport', 'Air Superiority Fighter', 'Strategic Bomber', 'Heavy/Anti-Air Gunship', 'Spy Plane', 'Heavy Air Transport'],
  'Naval': ['Attack Submarine', 'Frigate', 'Anti-Air Boat', 'Submarine', 'Destroyer', 'Cruiser', 'Torpedo Boat', 'Anti-Submersible Boat', 'Shield Boat', 'Counter-Intelligence Boat', 'Submarine Hunter', 'Battleship', 'Strategic Missile Submarine', 'Tactical Submarine', 'Aircraft Carrier', 'Battlecruiser', 'Missile Ship'],
  'Experimental': ['Direct Fire Experimental', 'Air Experimental', 'Naval Experimental', 'Indirect Fire Experimental', 'Other Experimental'],
  'Structures - Weapons': ['Point Defense', 'Anti-Air Turret', 'Torpedo Launcher', 'Anti-Air Flak Artillery', 'Artillery Installation', 'Tactical Missile Launcher', 'Tactical Missile Defense', 'Heavy Point Defense', 'Anti-Air SAM Launcher', 'Torpedo Ambushing System', 'Heavy Artillery Installation', 'Rocket Artillery Installation', 'Rapid-Fire Artillery Installation', 'Strategic Missile Launcher', 'Strategic Missile Defense'],
  'Structures - Support': ['Wall Section', 'Air Staging Facility', 'Shield Generator', 'Stealth Shield Generator', 'Heavy Shield Generator', 'Heavy Stealth Shield Generator'],
  'Structures - Intelligence': ['Radar System', 'Sonar System', 'Stealth Field Generator', 'Omni Sensor Array', 'Sonar Platform', 'Perimeter Monitoring System', 'Quantum Optics Facility'],
  'Structures - Economy': ['Mass Extractor', 'Power Generator', 'Hydrocarbon Power Plant', 'Energy Storage', 'Mass Storage', 'Mass Fabricator'],
  'Structures - Factories': ['Land Factory', 'Air Factory', 'Naval Factory', 'Quantum Gateway'],
}

export const TypeToSection = Object.fromEntries(
  Object.entries(sectionByType).flatMap(([section, types]) => types.map(t => [t, section]))
)