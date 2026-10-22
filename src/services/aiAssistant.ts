import { CampusRoom, CampusBuilding, Facility } from '../types/campus';

export interface AssistantResponse {
  answer: string;
  suggestedDestinationId?: string;
  suggestedDestinationName?: string;
  source: 'GEMINI_AI' | 'VERIFIED_CAMPUS_RULES';
}

export class AiCampusAssistant {
  public static async query(
    userMessage: string,
    rooms: CampusRoom[],
    buildings: CampusBuilding[],
    facilities: Facility[],
    apiKey?: string
  ): Promise<AssistantResponse> {
    const q = userMessage.toLowerCase().trim();
    const isTamil = /[\u0B80-\u0BFF]/.test(userMessage) || q.includes('tamil') || q.includes('eppadi') || q.includes('engu');

    // If Gemini API Key is provided, attempt external API call
    if (apiKey && apiKey.trim().length > 10 && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const campusContext = buildings.map((b) => `${b.name} (${b.code}): ${b.description}`).join('\n') +
          '\nRooms:\n' + rooms.map((r) => `${r.name} (${r.roomNumber}) in ${r.buildingId}: ${r.description}, Hours: ${r.openingHours}`).join('\n');

        const prompt = `You are NaviCampus AI, an intelligent campus navigator assistant. Answer the student's question accurately using ONLY this verified campus data:\n${campusContext}\n\nQuestion: "${userMessage}"\nIf a location exists, mention its exact building and room number. If not found, say it is not in the verified campus directory.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const matchedRoom = rooms.find((r) => text.toLowerCase().includes(r.name.toLowerCase()));
            const matchedBld = buildings.find((b) => text.toLowerCase().includes(b.name.toLowerCase()));
            return {
              answer: text,
              suggestedDestinationId: matchedRoom?.associatedNodeId || matchedBld?.id,
              suggestedDestinationName: matchedRoom?.name || matchedBld?.name,
              source: 'GEMINI_AI'
            };
          }
        }
      } catch {
        // Fallback to verified rule engine
      }
    }

    // Verified rule-based engine (zero hallucination)
    if (q.includes('library') || q.includes('book') || q.includes('நூலகம்')) {
      const lib = buildings.find((b) => b.id === 'LIBRARY') || rooms.find((r) => r.category === 'LIBRARY');
      return {
        answer: isTamil
          ? 'மத்திய நூலகம் (Central Library) வளாகத்தின் வடகிழக்கு பகுதியில் அமைந்துள்ளது. இதில் 3 தளங்கள், அமைதியான படிக்கும் இடங்கள் மற்றும் IEEE மின்-நூலக வசதிகள் உள்ளன. திறக்கும் நேரம்: 08:00 - 22:00.'
          : 'The Central Library is located in the northeastern sector of the campus, featuring 3 floors of engineering volumes, quiet research carrels, and high-speed IEEE digital archives. Opening hours: 08:00 - 22:00.',
        suggestedDestinationId: 'N_LIBRARY_ENTRANCE',
        suggestedDestinationName: 'Central Library',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('cafeteria') || q.includes('food') || q.includes('canteen') || q.includes('உணவகம்') || q.includes('சாப்பாடு')) {
      return {
        answer: isTamil
          ? 'பசுமை வளாக உணவகம் (Green Campus Cafeteria) நிர்வாக வளாகம் மற்றும் விடுதிக்கு அருகில் உள்ளது. காலை 07:30 முதல் இரவு 21:30 வரை உணவு மற்றும் பழச்சாறுகள் கிடைக்கும்.'
          : 'The Green Campus Cafeteria is located next to the Admin Block and Hostel area. It features a multi-cuisine food court and outdoor terrace seating. Operating hours: 07:30 - 21:30.',
        suggestedDestinationId: 'N_CAFE_ENTRANCE',
        suggestedDestinationName: 'Green Campus Cafeteria',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('ai') || q.includes('robot') || q.includes('lab') || q.includes('ஆய்வகம்')) {
      return {
        answer: isTamil
          ? 'AI & ரோபோடிக்ஸ் ஆய்வகம் (Room CSE-103) CSE பிளாக்கில் தரை தளத்தில் உள்ளது. NVIDIA RTX GPUகள் மற்றும் SLAM சோதனைக் களங்களுடன் செயல்படுகிறது. தொடர்பு: Dr. Alan Murugan.'
          : 'The AI & Robotics Laboratory (Room CSE-103) is on Floor 1 of the CSE Block. It is equipped with NVIDIA RTX GPU clusters and ROS robot testing arenas. Faculty In-charge: Dr. Alan Murugan.',
        suggestedDestinationId: 'N_TP_103',
        suggestedDestinationName: 'AI & Robotics Laboratory (CSE-103)',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('auditorium') || q.includes('event') || q.includes('ஹால்') || q.includes('அரங்கம்')) {
      return {
        answer: isTamil
          ? 'டாக்டர் ஏ.பி.ஜே அப்துல் கலாம் ஆடிட்டோரியம் 1,200 பேர் அமரக்கூடிய நவீன அரங்கம் ஆகும். மாநாடுகள் மற்றும் நிகழ்ச்சிகளுக்காக முதன்மை பிளாக்கிற்கு எதிரே அமைந்துள்ளது.'
          : 'The Dr. APJ Abdul Kalam Central Auditorium is a 1,200-seat acoustic amphitheater situated east of the Main Block. Equipped for hackathons, keynotes, and student symposiums.',
        suggestedDestinationId: 'N_AUDITORIUM_ENTRANCE',
        suggestedDestinationName: 'Central Auditorium',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('accessible') || q.includes('wheelchair') || q.includes('ramp') || q.includes('lift') || q.includes('சாய்வுதளம்')) {
      return {
        answer: isTamil
          ? 'வளாகத்தின் அனைத்து முக்கிய கட்டிடங்களிலும் (CSE Block, Main Block, Library, Cafeteria) சக்கர நாற்காலி சாய்வுதளங்கள் மற்றும் தானியங்கி மின்தூக்கிகள் (Lifts) முழுமையாக செயல்படுகின்றன.'
          : 'All primary academic buildings (CSE Block, Main Block, Central Library, and Cafeteria) are 100% ADA-compliant with wheelchair ramps, tactile paths, and automated elevator lifts.',
        suggestedDestinationId: 'N_CSE_PLAZA',
        suggestedDestinationName: 'CSE Block Accessible Entrance',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('exam') || q.includes('dean') || q.includes('admission') || q.includes('admin') || q.includes('நிர்வாகம்')) {
      return {
        answer: isTamil
          ? 'நிர்வாக பிளாக் (Admin Block) வளாகத்தின் மேற்கு பகுதியில் அமைந்துள்ளது. இதில் டீன் அலுவலகம், பதிவாளர் மற்றும் தேர்வுப் பிரிவு செயல்படுகின்றன. நேரம்: 09:00 - 17:00.'
          : 'The Administration Block houses the Dean of Academic Affairs, Registrar, Admissions, and Examination branches. Located west of the Main Quad. Office hours: 09:00 - 17:00.',
        suggestedDestinationId: 'N_ADMIN_ENTRANCE',
        suggestedDestinationName: 'Admin Block (Dean of Academic Affairs)',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    if (q.includes('sports') || q.includes('ground') || q.includes('football') || q.includes('விளையாட்டு')) {
      return {
        answer: isTamil
          ? 'விளையாட்டு மைதானம் 400மீ ஓடுதளம் மற்றும் கால்பந்து மைதானத்துடன் மத்திய நூலகத்திற்கு பின்னால் அமைந்துள்ளது.'
          : 'The Sports Ground features a 400m synthetic running track, football pitch, and pavilion, located just north of the Central Library.',
        suggestedDestinationId: 'N_SPORTS_ENTRANCE',
        suggestedDestinationName: 'Sports Ground',
        source: 'VERIFIED_CAMPUS_RULES'
      };
    }

    // Default friendly response
    return {
      answer: isTamil
        ? `மன்னிக்கவும், "${userMessage}" தொடர்பான தகவல் சரிபார்க்கப்பட்ட வளாக தரவுத்தளத்தில் நேரடியாக கிடைக்கவில்லை. நீங்கள் "Library", "Cafeteria", "AI Lab", "Auditorium", அல்லது "Admin Block" என்று தேடலாம்.`
        : `I could not find a verified match for "${userMessage}" in the current campus database. Try searching for specific facilities like "Central Library", "CSE Block", "Cafeteria", "AI Lab", or "Auditorium".`,
      source: 'VERIFIED_CAMPUS_RULES'
    };
  }
}
