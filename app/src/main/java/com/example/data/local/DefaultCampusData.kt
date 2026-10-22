package com.example.data.local

import com.example.data.model.*

object DefaultCampusData {

    val COLLEGES = listOf(
        CollegeCampus(
            id = "TECH_UNIVERSITY",
            name = "Apex Institute of Technology & AI",
            location = "Chennai, Tamil Nadu",
            description = "Smart engineering campus with Tech Park, Science Complex, and Innovation Hub."
        ),
        CollegeCampus(
            id = "ANNA_UNIV",
            name = "College of Engineering Guindy (Anna University)",
            location = "Guindy, Chennai",
            description = "Historic engineering campus with Main Heritage Building, CS Block, and Library."
        ),
        CollegeCampus(
            id = "IIT_MADRAS",
            name = "IIT Madras Research & Tech Campus",
            location = "Adyar, Chennai",
            description = "Premier institute campus with Research Park, Central Lecture Theatre, and Innovation Labs."
        )
    )

    fun getInitialColleges(): List<CollegeEntity> = COLLEGES.map {
        CollegeEntity(
            id = it.id,
            name = it.name,
            location = it.location,
            description = it.description,
            isCustom = it.isCustom
        )
    }

    val BUILDINGS = listOf(
        Building(
            id = "TP",
            name = "Tech & Engineering Park",
            code = "TP",
            description = "Main computing hub housing AI laboratories, engineering lecture halls, and central auditorium.",
            numFloors = 3,
            defaultFloor = 1
        ),
        Building(
            id = "SB",
            name = "Science & Research Complex",
            code = "SB",
            description = "Center for quantum physics, bioinformatics, chemistry, and research facilities.",
            numFloors = 2,
            defaultFloor = 1
        ),
        Building(
            id = "SH",
            name = "Student Innovation Hub",
            code = "SH",
            description = "Student life center with campus cafeteria, health clinic, and collaboration spaces.",
            numFloors = 2,
            defaultFloor = 1
        )
    )

    val FLOORS = listOf(
        Floor("TP_F1", "TP", 1, "Ground Floor (L1)"),
        Floor("TP_F2", "TP", 2, "Second Floor (L2)"),
        Floor("TP_F3", "TP", 3, "Third Floor (L3)"),
        Floor("SB_F1", "SB", 1, "Ground Floor (L1)"),
        Floor("SB_F2", "SB", 2, "Second Floor (L2)"),
        Floor("SH_F1", "SH", 1, "Ground Floor (L1)"),
        Floor("SH_F2", "SH", 2, "Second Floor (L2)")
    )

    fun getInitialRooms(): List<RoomEntity> = listOf(
        // Tech Park - Floor 1
        RoomEntity(
            id = "TP-101",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "101",
            name = "Smart Classroom Alpha",
            category = RoomCategory.CLASSROOM.name,
            x = 160f, y = 170f, width = 130f, height = 90f,
            isAccessible = true,
            description = "Interactive multimedia smart classroom equipped with dual laser displays.",
            facultyOrContact = "Dr. Robert Vance (CS Dept)",
            openingHours = "08:00 - 18:00",
            associatedNodeId = "N_TP_101"
        ),
        RoomEntity(
            id = "TP-102",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "102",
            name = "Smart Classroom Beta",
            category = RoomCategory.CLASSROOM.name,
            x = 320f, y = 170f, width = 130f, height = 90f,
            isAccessible = true,
            description = "Collaborative learning classroom with round group study tables.",
            facultyOrContact = "Prof. Angela Davis",
            openingHours = "08:00 - 18:00",
            associatedNodeId = "N_TP_102"
        ),
        RoomEntity(
            id = "TP-103",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "103",
            name = "AI & Robotics Laboratory",
            category = RoomCategory.AI_LAB.name,
            x = 520f, y = 170f, width = 170f, height = 90f,
            isAccessible = true,
            description = "Equipped with NVIDIA RTX GPU workstations, Boston Dynamics Spot robot, and ROS testing arena.",
            facultyOrContact = "Dr. Alan Murugan (Head of AI)",
            openingHours = "08:30 - 20:00",
            associatedNodeId = "N_TP_103",
            isFavorite = true
        ),
        RoomEntity(
            id = "TP-104",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "104",
            name = "Computer Vision Center",
            category = RoomCategory.AI_LAB.name,
            x = 730f, y = 170f, width = 160f, height = 90f,
            isAccessible = true,
            description = "High-speed camera sensor rigs and embedded Jetson modules for real-time vision analytics.",
            facultyOrContact = "Prof. Priya Chandran",
            openingHours = "09:00 - 19:00",
            associatedNodeId = "N_TP_104"
        ),
        RoomEntity(
            id = "TP-105",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "105",
            name = "Turing Mega Auditorium",
            category = RoomCategory.AUDITORIUM.name,
            x = 160f, y = 470f, width = 230f, height = 140f,
            isAccessible = true,
            description = "500-seat amphitheater auditorium for keynotes, hackathons, and guest lectures.",
            facultyOrContact = "Auditorium Manager (Ext 401)",
            openingHours = "09:00 - 21:00",
            associatedNodeId = "N_TP_105"
        ),
        RoomEntity(
            id = "TP-106",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "106",
            name = "Accessible Restroom L1",
            category = RoomCategory.RESTROOM.name,
            x = 590f, y = 470f, width = 110f, height = 80f,
            isAccessible = true,
            description = "ADA compliant wheelchair-accessible gender-neutral restroom with emergency pull-cord.",
            facultyOrContact = "Facilities Management",
            openingHours = "24 Hours",
            associatedNodeId = "N_TP_106"
        ),
        RoomEntity(
            id = "TP-107",
            buildingId = "TP",
            floorNumber = 1,
            roomNumber = "107",
            name = "Tech Park Main Entrance",
            category = RoomCategory.ENTRANCE.name,
            x = 750f, y = 470f, width = 150f, height = 80f,
            isAccessible = true,
            description = "Glass entrance lobby with wheelchair ramp and campus security reception desk.",
            facultyOrContact = "Security Station 1",
            openingHours = "24 Hours",
            associatedNodeId = "N_TP_107"
        ),

        // Tech Park - Floor 2
        RoomEntity(
            id = "TP-201",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "201",
            name = "Deep Learning & NLP Lab",
            category = RoomCategory.AI_LAB.name,
            x = 160f, y = 170f, width = 140f, height = 90f,
            isAccessible = true,
            description = "Large language model training cluster and natural language processing workstation lab.",
            facultyOrContact = "Dr. Vikram Seth",
            openingHours = "08:30 - 19:30",
            associatedNodeId = "N_TP_201"
        ),
        RoomEntity(
            id = "TP-202",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "202",
            name = "Cybersecurity Defense Lab",
            category = RoomCategory.AI_LAB.name,
            x = 330f, y = 170f, width = 140f, height = 90f,
            isAccessible = true,
            description = "Air-gapped networking defense arena and penetration testing simulation center.",
            facultyOrContact = "Prof. Marcus Brody",
            openingHours = "09:00 - 18:00",
            associatedNodeId = "N_TP_202"
        ),
        RoomEntity(
            id = "TP-203",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "203",
            name = "IoT & Embedded Systems Lab",
            category = RoomCategory.AI_LAB.name,
            x = 520f, y = 170f, width = 160f, height = 90f,
            isAccessible = true,
            description = "Microcontrollers, ARM development kits, 3D printers, and edge computing boards.",
            facultyOrContact = "Dr. Ananya Nair",
            openingHours = "09:00 - 18:30",
            associatedNodeId = "N_TP_203"
        ),
        RoomEntity(
            id = "TP-204",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "204",
            name = "Advanced Seminar Hall",
            category = RoomCategory.AUDITORIUM.name,
            x = 730f, y = 170f, width = 160f, height = 90f,
            isAccessible = true,
            description = "Tiered presentation hall for research seminars and thesis defenses.",
            facultyOrContact = "Academic Secretariat",
            openingHours = "09:00 - 18:00",
            associatedNodeId = "N_TP_204"
        ),
        RoomEntity(
            id = "TP-205",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "205",
            name = "Central Digital Library",
            category = RoomCategory.LIBRARY.name,
            x = 160f, y = 470f, width = 230f, height = 140f,
            isAccessible = true,
            description = "Silent study area, digital archive terminals, group study cubicles, and IEEE collection.",
            facultyOrContact = "Head Librarian (Ext 305)",
            openingHours = "07:30 - 22:00",
            associatedNodeId = "N_TP_205",
            isFavorite = true
        ),
        RoomEntity(
            id = "TP-206",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "206",
            name = "Accessible Restroom L2",
            category = RoomCategory.RESTROOM.name,
            x = 590f, y = 470f, width = 110f, height = 80f,
            isAccessible = true,
            description = "Clean wheelchair-accessible restroom on Level 2 with automated tactile doors.",
            facultyOrContact = "Facilities Management",
            openingHours = "24 Hours",
            associatedNodeId = "N_TP_206"
        ),
        RoomEntity(
            id = "TP-207",
            buildingId = "TP",
            floorNumber = 2,
            roomNumber = "207",
            name = "Faculty Innovation Lounge",
            category = RoomCategory.FACULTY.name,
            x = 750f, y = 470f, width = 150f, height = 80f,
            isAccessible = true,
            description = "Faculty consultation desks and department conference area.",
            facultyOrContact = "Professors Directory (Ext 200)",
            openingHours = "09:00 - 17:00",
            associatedNodeId = "N_TP_207"
        ),

        // Tech Park - Floor 3
        RoomEntity(
            id = "TP-301",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "301",
            name = "Dean of Computing Office",
            category = RoomCategory.ADMIN.name,
            x = 160f, y = 170f, width = 150f, height = 90f,
            isAccessible = true,
            description = "Executive office of the Dean of Computing and Technology.",
            facultyOrContact = "Dean Dr. C. Balakrishnan",
            openingHours = "10:00 - 16:30",
            associatedNodeId = "N_TP_301"
        ),
        RoomEntity(
            id = "TP-302",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "302",
            name = "High Performance Compute Center",
            category = RoomCategory.AI_LAB.name,
            x = 340f, y = 170f, width = 150f, height = 90f,
            isAccessible = true,
            description = "Supercomputer datacenter facility with cold aisle containment.",
            facultyOrContact = "SysAdmin Team",
            openingHours = "Restricted Access",
            associatedNodeId = "N_TP_302"
        ),
        RoomEntity(
            id = "TP-303",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "303",
            name = "Software Engineering Studio",
            category = RoomCategory.CLASSROOM.name,
            x = 530f, y = 170f, width = 160f, height = 90f,
            isAccessible = true,
            description = "Agile scrum development studio for capstone and industry projects.",
            facultyOrContact = "Prof. Sundar Raj",
            openingHours = "08:30 - 18:30",
            associatedNodeId = "N_TP_303"
        ),
        RoomEntity(
            id = "TP-304",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "304",
            name = "Graduate Research Commons",
            category = RoomCategory.FACULTY.name,
            x = 730f, y = 170f, width = 160f, height = 90f,
            isAccessible = true,
            description = "PhD researcher workstations and private discussion pods.",
            facultyOrContact = "Doctoral Committee",
            openingHours = "08:00 - 20:00",
            associatedNodeId = "N_TP_304"
        ),
        RoomEntity(
            id = "TP-305",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "305",
            name = "Tech Incubator & Startup Pods",
            category = RoomCategory.ADMIN.name,
            x = 160f, y = 470f, width = 230f, height = 140f,
            isAccessible = true,
            description = "University campus incubator, venture mentorship office, and pitch room.",
            facultyOrContact = "Incubation Manager (Ext 502)",
            openingHours = "09:00 - 19:00",
            associatedNodeId = "N_TP_305"
        ),
        RoomEntity(
            id = "TP-306",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "306",
            name = "Accessible Restroom L3",
            category = RoomCategory.RESTROOM.name,
            x = 590f, y = 470f, width = 110f, height = 80f,
            isAccessible = true,
            description = "Wheelchair accessible restroom on Level 3.",
            facultyOrContact = "Facilities Management",
            openingHours = "24 Hours",
            associatedNodeId = "N_TP_306"
        ),
        RoomEntity(
            id = "TP-307",
            buildingId = "TP",
            floorNumber = 3,
            roomNumber = "307",
            name = "Executive Boardroom",
            category = RoomCategory.ADMIN.name,
            x = 750f, y = 470f, width = 150f, height = 80f,
            isAccessible = true,
            description = "Meeting room for academic senate and university trustees.",
            facultyOrContact = "Registrar Secretariat",
            openingHours = "09:00 - 17:00",
            associatedNodeId = "N_TP_307"
        ),

        // Science Block - Floor 1
        RoomEntity(
            id = "SB-101",
            buildingId = "SB",
            floorNumber = 1,
            roomNumber = "101",
            name = "Quantum Physics Laboratory",
            category = RoomCategory.AI_LAB.name,
            x = 180f, y = 180f, width = 180f, height = 100f,
            isAccessible = true,
            description = "Optics tables, laser interferometry, and cryogenic qubit research setups.",
            facultyOrContact = "Dr. Walter Bishop",
            openingHours = "08:30 - 18:00",
            associatedNodeId = "N_SB_101"
        ),
        RoomEntity(
            id = "SB-102",
            buildingId = "SB",
            floorNumber = 1,
            roomNumber = "102",
            name = "Bio-Informatics Research Center",
            category = RoomCategory.AI_LAB.name,
            x = 540f, y = 180f, width = 180f, height = 100f,
            isAccessible = true,
            description = "Genomic sequence computation and molecular modeling laboratory.",
            facultyOrContact = "Dr. Meenakshi Sundaram",
            openingHours = "09:00 - 18:30",
            associatedNodeId = "N_SB_102"
        ),
        RoomEntity(
            id = "SB-103",
            buildingId = "SB",
            floorNumber = 1,
            roomNumber = "103",
            name = "Science Lecture Hall 1",
            category = RoomCategory.CLASSROOM.name,
            x = 220f, y = 470f, width = 200f, height = 120f,
            isAccessible = true,
            description = "Large general sciences tiered lecture theatre.",
            facultyOrContact = "Science Dept Office",
            openingHours = "08:00 - 18:00",
            associatedNodeId = "N_SB_103"
        ),
        RoomEntity(
            id = "SB-104",
            buildingId = "SB",
            floorNumber = 1,
            roomNumber = "104",
            name = "Science Complex Entrance",
            category = RoomCategory.ENTRANCE.name,
            x = 640f, y = 470f, width = 160f, height = 90f,
            isAccessible = true,
            description = "Science quad entrance with accessible ramp and touch-screen campus kiosk.",
            facultyOrContact = "Security Station 2",
            openingHours = "24 Hours",
            associatedNodeId = "N_SB_104"
        ),

        // Student Innovation Hub - Floor 1
        RoomEntity(
            id = "SH-101",
            buildingId = "SH",
            floorNumber = 1,
            roomNumber = "101",
            name = "Green Campus Cafeteria & Food Court",
            category = RoomCategory.CAFETERIA.name,
            x = 180f, y = 180f, width = 240f, height = 120f,
            isAccessible = true,
            description = "Full dining services, hot meals, South Indian & Continental options, juice bar, and outdoor terrace.",
            facultyOrContact = "Campus Dining Services",
            openingHours = "07:30 - 21:00",
            associatedNodeId = "N_SH_101",
            isFavorite = true
        ),
        RoomEntity(
            id = "SH-102",
            buildingId = "SH",
            floorNumber = 1,
            roomNumber = "102",
            name = "Student Welfare & Affairs Office",
            category = RoomCategory.ADMIN.name,
            x = 580f, y = 180f, width = 180f, height = 100f,
            isAccessible = true,
            description = "Student cards, scholarships, extracurricular coordination, and counseling services.",
            facultyOrContact = "Dean of Student Affairs",
            openingHours = "09:00 - 17:00",
            associatedNodeId = "N_SH_102"
        ),
        RoomEntity(
            id = "SH-103",
            buildingId = "SH",
            floorNumber = 1,
            roomNumber = "103",
            name = "Campus Health Clinic & First Aid",
            category = RoomCategory.ADMIN.name,
            x = 180f, y = 470f, width = 200f, height = 110f,
            isAccessible = true,
            description = "24/7 medical room, doctor on duty, automated defibrillator (AED), wheelchair availability, and ambulance bay.",
            facultyOrContact = "Dr. Shalini (Chief Medical Officer)",
            openingHours = "24 Hours Emergency",
            associatedNodeId = "N_SH_103",
            isFavorite = true
        ),
        RoomEntity(
            id = "SH-104",
            buildingId = "SH",
            floorNumber = 1,
            roomNumber = "104",
            name = "Student Hub Plaza Entrance",
            category = RoomCategory.ENTRANCE.name,
            x = 640f, y = 470f, width = 160f, height = 90f,
            isAccessible = true,
            description = "Central social plaza entrance connecting main walkways.",
            facultyOrContact = "Security Desk SH",
            openingHours = "24 Hours",
            associatedNodeId = "N_SH_104"
        )
    )

    fun getInitialNavNodes(): List<NavNode> {
        val nodes = mutableListOf<NavNode>()

        // Tech Park - Floor 1
        nodes.add(NavNode("N_TP_EXIT_W1", "TP", 1, 60f, 340f, NavNodeType.EMERGENCY_EXIT, "West Emergency Exit F1"))
        nodes.add(NavNode("N_TP_CORR_1", "TP", 1, 120f, 340f, NavNodeType.NORMAL, "Corridor West F1"))
        nodes.add(NavNode("N_TP_101", "TP", 1, 225f, 290f, NavNodeType.ROOM_DOOR, "Door TP-101"))
        nodes.add(NavNode("N_TP_CORR_2", "TP", 1, 225f, 340f, NavNodeType.NORMAL, "Junction 101/105 F1"))
        nodes.add(NavNode("N_TP_105", "TP", 1, 225f, 440f, NavNodeType.ROOM_DOOR, "Auditorium Door TP-105"))
        nodes.add(NavNode("N_TP_102", "TP", 1, 385f, 290f, NavNodeType.ROOM_DOOR, "Door TP-102"))
        nodes.add(NavNode("N_TP_CORR_3", "TP", 1, 385f, 340f, NavNodeType.NORMAL, "Junction 102 F1"))
        
        // Central Atrium Floor 1
        nodes.add(NavNode("N_TP_CORR_4", "TP", 1, 500f, 340f, NavNodeType.NORMAL, "Central Atrium F1"))
        nodes.add(NavNode("N_TP_STAIRS_1", "TP", 1, 460f, 400f, NavNodeType.STAIRS, "Main Stairs L1"))
        nodes.add(NavNode("N_TP_LIFT_1", "TP", 1, 500f, 410f, NavNodeType.LIFT, "Elevator Lift L1 (Accessible)"))
        nodes.add(NavNode("N_TP_RAMP_1", "TP", 1, 540f, 400f, NavNodeType.RAMP, "Accessible Ramp L1"))

        nodes.add(NavNode("N_TP_103", "TP", 1, 605f, 290f, NavNodeType.ROOM_DOOR, "Door TP-103 (AI Lab)"))
        nodes.add(NavNode("N_TP_CORR_5", "TP", 1, 605f, 340f, NavNodeType.NORMAL, "Junction AI Lab/Restroom F1"))
        nodes.add(NavNode("N_TP_106", "TP", 1, 645f, 440f, NavNodeType.ROOM_DOOR, "Door Restroom F1"))

        nodes.add(NavNode("N_TP_104", "TP", 1, 810f, 290f, NavNodeType.ROOM_DOOR, "Door TP-104 (Vision Lab)"))
        nodes.add(NavNode("N_TP_CORR_6", "TP", 1, 810f, 340f, NavNodeType.NORMAL, "Junction 104/Entrance F1"))
        nodes.add(NavNode("N_TP_107", "TP", 1, 825f, 440f, NavNodeType.ENTRANCE, "Main Entrance TP F1"))
        nodes.add(NavNode("N_TP_EXIT_E1", "TP", 1, 940f, 340f, NavNodeType.EMERGENCY_EXIT, "East Emergency Exit F1"))

        // Tech Park - Floor 2
        nodes.add(NavNode("N_TP_EXIT_W2", "TP", 2, 60f, 340f, NavNodeType.EMERGENCY_EXIT, "West Emergency Exit F2"))
        nodes.add(NavNode("N_TP_201", "TP", 2, 230f, 290f, NavNodeType.ROOM_DOOR, "Door TP-201"))
        nodes.add(NavNode("N_TP_CORR_F2_1", "TP", 2, 230f, 340f, NavNodeType.NORMAL, "Junction 201/205 F2"))
        nodes.add(NavNode("N_TP_205", "TP", 2, 230f, 440f, NavNodeType.ROOM_DOOR, "Library Door TP-205"))
        nodes.add(NavNode("N_TP_202", "TP", 2, 400f, 290f, NavNodeType.ROOM_DOOR, "Door TP-202"))
        nodes.add(NavNode("N_TP_CORR_F2_2", "TP", 2, 400f, 340f, NavNodeType.NORMAL, "Junction 202 F2"))
        nodes.add(NavNode("N_TP_CORR_F2_C", "TP", 2, 500f, 340f, NavNodeType.NORMAL, "Central Atrium F2"))
        nodes.add(NavNode("N_TP_STAIRS_2", "TP", 2, 460f, 400f, NavNodeType.STAIRS, "Main Stairs L2"))
        nodes.add(NavNode("N_TP_LIFT_2", "TP", 2, 500f, 410f, NavNodeType.LIFT, "Elevator Lift L2 (Accessible)"))
        nodes.add(NavNode("N_TP_203", "TP", 2, 600f, 290f, NavNodeType.ROOM_DOOR, "Door TP-203"))
        nodes.add(NavNode("N_TP_CORR_F2_3", "TP", 2, 600f, 340f, NavNodeType.NORMAL, "Junction 203/Restroom F2"))
        nodes.add(NavNode("N_TP_206", "TP", 2, 645f, 440f, NavNodeType.ROOM_DOOR, "Door Restroom F2"))
        nodes.add(NavNode("N_TP_204", "TP", 2, 810f, 290f, NavNodeType.ROOM_DOOR, "Door TP-204"))
        nodes.add(NavNode("N_TP_CORR_F2_4", "TP", 2, 810f, 340f, NavNodeType.NORMAL, "Junction 204/Lounge F2"))
        nodes.add(NavNode("N_TP_207", "TP", 2, 825f, 440f, NavNodeType.ROOM_DOOR, "Faculty Lounge Door TP-207"))
        nodes.add(NavNode("N_TP_EXIT_E2", "TP", 2, 940f, 340f, NavNodeType.EMERGENCY_EXIT, "East Emergency Exit F2"))

        // Tech Park - Floor 3
        nodes.add(NavNode("N_TP_EXIT_W3", "TP", 3, 60f, 340f, NavNodeType.EMERGENCY_EXIT, "West Emergency Exit F3"))
        nodes.add(NavNode("N_TP_301", "TP", 3, 235f, 290f, NavNodeType.ROOM_DOOR, "Door Dean Office TP-301"))
        nodes.add(NavNode("N_TP_CORR_F3_1", "TP", 3, 235f, 340f, NavNodeType.NORMAL, "Junction 301/305 F3"))
        nodes.add(NavNode("N_TP_305", "TP", 3, 235f, 440f, NavNodeType.ROOM_DOOR, "Incubator Door TP-305"))
        nodes.add(NavNode("N_TP_302", "TP", 3, 415f, 290f, NavNodeType.ROOM_DOOR, "HPC Cluster Door TP-302"))
        nodes.add(NavNode("N_TP_CORR_F3_2", "TP", 3, 415f, 340f, NavNodeType.NORMAL, "Junction 302 F3"))
        nodes.add(NavNode("N_TP_CORR_F3_C", "TP", 3, 500f, 340f, NavNodeType.NORMAL, "Central Atrium F3"))
        nodes.add(NavNode("N_TP_STAIRS_3", "TP", 3, 460f, 400f, NavNodeType.STAIRS, "Main Stairs L3"))
        nodes.add(NavNode("N_TP_LIFT_3", "TP", 3, 500f, 410f, NavNodeType.LIFT, "Elevator Lift L3 (Accessible)"))
        nodes.add(NavNode("N_TP_303", "TP", 3, 610f, 290f, NavNodeType.ROOM_DOOR, "Software Studio Door TP-303"))
        nodes.add(NavNode("N_TP_CORR_F3_3", "TP", 3, 610f, 340f, NavNodeType.NORMAL, "Junction 303/Restroom F3"))
        nodes.add(NavNode("N_TP_306", "TP", 3, 645f, 440f, NavNodeType.ROOM_DOOR, "Door Restroom F3"))
        nodes.add(NavNode("N_TP_304", "TP", 3, 810f, 290f, NavNodeType.ROOM_DOOR, "Research Commons Door TP-304"))
        nodes.add(NavNode("N_TP_CORR_F3_4", "TP", 3, 810f, 340f, NavNodeType.NORMAL, "Junction 304/Boardroom F3"))
        nodes.add(NavNode("N_TP_307", "TP", 3, 825f, 440f, NavNodeType.ROOM_DOOR, "Boardroom Door TP-307"))
        nodes.add(NavNode("N_TP_EXIT_E3", "TP", 3, 940f, 340f, NavNodeType.EMERGENCY_EXIT, "East Emergency Exit F3"))

        // Science Block - Floor 1
        nodes.add(NavNode("N_SB_101", "SB", 1, 270f, 300f, NavNodeType.ROOM_DOOR, "Door Physics Lab SB-101"))
        nodes.add(NavNode("N_SB_103", "SB", 1, 320f, 440f, NavNodeType.ROOM_DOOR, "Door Lecture Hall SB-103"))
        nodes.add(NavNode("N_SB_CORR_1", "SB", 1, 300f, 370f, NavNodeType.NORMAL, "Junction Physics SB F1"))
        nodes.add(NavNode("N_SB_CORR_C", "SB", 1, 500f, 370f, NavNodeType.NORMAL, "Central Plaza SB F1"))
        nodes.add(NavNode("N_SB_102", "SB", 1, 630f, 300f, NavNodeType.ROOM_DOOR, "Door Bio-Info Lab SB-102"))
        nodes.add(NavNode("N_SB_104", "SB", 1, 720f, 440f, NavNodeType.ENTRANCE, "Science Entrance SB-104"))
        nodes.add(NavNode("N_SB_CORR_2", "SB", 1, 680f, 370f, NavNodeType.NORMAL, "Junction Entrance SB F1"))
        nodes.add(NavNode("N_SB_EXIT_1", "SB", 1, 900f, 370f, NavNodeType.EMERGENCY_EXIT, "Science Emergency Exit"))

        // Student Hub - Floor 1
        nodes.add(NavNode("N_SH_101", "SH", 1, 300f, 320f, NavNodeType.ROOM_DOOR, "Cafeteria Door SH-101"))
        nodes.add(NavNode("N_SH_103", "SH", 1, 280f, 440f, NavNodeType.ROOM_DOOR, "Health Clinic Door SH-103"))
        nodes.add(NavNode("N_SH_CORR_1", "SH", 1, 300f, 380f, NavNodeType.NORMAL, "Junction Cafeteria/Clinic SH F1"))
        nodes.add(NavNode("N_SH_CORR_C", "SH", 1, 500f, 380f, NavNodeType.NORMAL, "Hub Central Hallway SH F1"))
        nodes.add(NavNode("N_SH_102", "SH", 1, 670f, 300f, NavNodeType.ROOM_DOOR, "Student Affairs Door SH-102"))
        nodes.add(NavNode("N_SH_104", "SH", 1, 720f, 440f, NavNodeType.ENTRANCE, "Hub Plaza Entrance SH-104"))
        nodes.add(NavNode("N_SH_CORR_2", "SH", 1, 690f, 380f, NavNodeType.NORMAL, "Junction Hub Entrance SH F1"))
        nodes.add(NavNode("N_SH_EXIT_1", "SH", 1, 900f, 380f, NavNodeType.EMERGENCY_EXIT, "Student Hub Emergency Exit"))

        return nodes
    }

    fun getInitialNavEdges(): List<EdgeEntity> {
        val edges = mutableListOf<EdgeEntity>()

        fun addEdge(id: String, from: String, to: String, dist: Float, accessible: Boolean = true, blocked: Boolean = false, reason: String = "") {
            edges.add(EdgeEntity(id, from, to, dist, accessible, blocked, reason))
            edges.add(EdgeEntity("${id}_rev", to, from, dist, accessible, blocked, reason))
        }

        // Tech Park - Floor 1 corridor spine
        addEdge("E_TP1_EXITW_C1", "N_TP_EXIT_W1", "N_TP_CORR_1", 12f)
        addEdge("E_TP1_C1_C2", "N_TP_CORR_1", "N_TP_CORR_2", 15f)
        addEdge("E_TP1_C2_101", "N_TP_CORR_2", "N_TP_101", 6f)
        addEdge("E_TP1_C2_105", "N_TP_CORR_2", "N_TP_105", 12f)
        addEdge("E_TP1_C2_C3", "N_TP_CORR_2", "N_TP_CORR_3", 18f)
        addEdge("E_TP1_C3_102", "N_TP_CORR_3", "N_TP_102", 6f)
        addEdge("E_TP1_C3_C4", "N_TP_CORR_3", "N_TP_CORR_4", 14f)

        // Atrium links
        addEdge("E_TP1_C4_STAIRS", "N_TP_CORR_4", "N_TP_STAIRS_1", 8f, accessible = true) // Ground floor stairs landing
        addEdge("E_TP1_C4_LIFT", "N_TP_CORR_4", "N_TP_LIFT_1", 9f, accessible = true)
        addEdge("E_TP1_C4_RAMP", "N_TP_CORR_4", "N_TP_RAMP_1", 8f, accessible = true)

        addEdge("E_TP1_C4_C5", "N_TP_CORR_4", "N_TP_CORR_5", 14f)
        addEdge("E_TP1_C5_103", "N_TP_CORR_5", "N_TP_103", 6f)
        addEdge("E_TP1_C5_106", "N_TP_CORR_5", "N_TP_106", 12f)
        addEdge("E_TP1_C5_C6", "N_TP_CORR_5", "N_TP_CORR_6", 22f)
        addEdge("E_TP1_C6_104", "N_TP_CORR_6", "N_TP_104", 6f)
        addEdge("E_TP1_C6_107", "N_TP_CORR_6", "N_TP_107", 12f)
        addEdge("E_TP1_C6_EXITE", "N_TP_CORR_6", "N_TP_EXIT_E1", 16f)

        // Tech Park - Floor 2 corridor spine
        addEdge("E_TP2_EXITW_C1", "N_TP_EXIT_W2", "N_TP_CORR_F2_1", 18f)
        addEdge("E_TP2_C1_201", "N_TP_CORR_F2_1", "N_TP_201", 6f)
        addEdge("E_TP2_C1_205", "N_TP_CORR_F2_1", "N_TP_205", 12f)
        addEdge("E_TP2_C1_C2", "N_TP_CORR_F2_1", "N_TP_CORR_F2_2", 18f)
        addEdge("E_TP2_C2_202", "N_TP_CORR_F2_2", "N_TP_202", 6f)
        addEdge("E_TP2_C2_CC", "N_TP_CORR_F2_2", "N_TP_CORR_F2_C", 14f)

        addEdge("E_TP2_CC_STAIRS", "N_TP_CORR_F2_C", "N_TP_STAIRS_2", 8f, accessible = true)
        addEdge("E_TP2_CC_LIFT", "N_TP_CORR_F2_C", "N_TP_LIFT_2", 9f, accessible = true)

        addEdge("E_TP2_CC_C3", "N_TP_CORR_F2_C", "N_TP_CORR_F2_3", 14f)
        addEdge("E_TP2_C3_203", "N_TP_CORR_F2_3", "N_TP_203", 6f)
        addEdge("E_TP2_C3_206", "N_TP_CORR_F2_3", "N_TP_206", 12f)
        addEdge("E_TP2_C3_C4", "N_TP_CORR_F2_3", "N_TP_CORR_F2_4", 22f)
        addEdge("E_TP2_C4_204", "N_TP_CORR_F2_4", "N_TP_204", 6f)
        addEdge("E_TP2_C4_207", "N_TP_CORR_F2_4", "N_TP_207", 12f)
        addEdge("E_TP2_C4_EXITE", "N_TP_CORR_F2_4", "N_TP_EXIT_E2", 16f)

        // Tech Park - Floor 3 corridor spine
        addEdge("E_TP3_EXITW_C1", "N_TP_EXIT_W3", "N_TP_CORR_F3_1", 18f)
        addEdge("E_TP3_C1_301", "N_TP_CORR_F3_1", "N_TP_301", 6f)
        addEdge("E_TP3_C1_305", "N_TP_CORR_F3_1", "N_TP_305", 12f)
        addEdge("E_TP3_C1_C2", "N_TP_CORR_F3_1", "N_TP_CORR_F3_2", 18f)
        addEdge("E_TP3_C2_302", "N_TP_CORR_F3_2", "N_TP_302", 6f)
        addEdge("E_TP3_C2_CC", "N_TP_CORR_F3_2", "N_TP_CORR_F3_C", 14f)

        addEdge("E_TP3_CC_STAIRS", "N_TP_CORR_F3_C", "N_TP_STAIRS_3", 8f, accessible = true)
        addEdge("E_TP3_CC_LIFT", "N_TP_CORR_F3_C", "N_TP_LIFT_3", 9f, accessible = true)

        addEdge("E_TP3_CC_C3", "N_TP_CORR_F3_C", "N_TP_CORR_F3_3", 14f)
        addEdge("E_TP3_C3_303", "N_TP_CORR_F3_3", "N_TP_303", 6f)
        addEdge("E_TP3_C3_306", "N_TP_CORR_F3_3", "N_TP_306", 12f)
        addEdge("E_TP3_C3_C4", "N_TP_CORR_F3_3", "N_TP_CORR_F3_4", 22f)
        addEdge("E_TP3_C4_304", "N_TP_CORR_F3_4", "N_TP_304", 6f)
        addEdge("E_TP3_C4_307", "N_TP_CORR_F3_4", "N_TP_307", 12f)
        addEdge("E_TP3_C4_EXITE", "N_TP_CORR_F3_4", "N_TP_EXIT_E3", 16f)

        // Vertical Transitions (Lifts & Stairs across Floors 1, 2, 3)
        // LIFT: Wheelchair accessible!
        addEdge("E_LIFT_1_2", "N_TP_LIFT_1", "N_TP_LIFT_2", 8f, accessible = true)
        addEdge("E_LIFT_2_3", "N_TP_LIFT_2", "N_TP_LIFT_3", 8f, accessible = true)

        // STAIRS: NOT accessible for wheelchairs (accessible = false)
        addEdge("E_STAIRS_1_2", "N_TP_STAIRS_1", "N_TP_STAIRS_2", 12f, accessible = false)
        addEdge("E_STAIRS_2_3", "N_TP_STAIRS_2", "N_TP_STAIRS_3", 12f, accessible = false)

        // Science Block Floor 1 edges
        addEdge("E_SB1_101_C1", "N_SB_101", "N_SB_CORR_1", 8f)
        addEdge("E_SB1_103_C1", "N_SB_103", "N_SB_CORR_1", 8f)
        addEdge("E_SB1_C1_CC", "N_SB_CORR_1", "N_SB_CORR_C", 20f)
        addEdge("E_SB1_CC_C2", "N_SB_CORR_C", "N_SB_CORR_2", 20f)
        addEdge("E_SB1_102_C2", "N_SB_102", "N_SB_CORR_2", 8f)
        addEdge("E_SB1_104_C2", "N_SB_104", "N_SB_CORR_2", 8f)
        addEdge("E_SB1_C2_EXIT", "N_SB_CORR_2", "N_SB_EXIT_1", 22f)

        // Student Hub Floor 1 edges
        addEdge("E_SH1_101_C1", "N_SH_101", "N_SH_CORR_1", 8f)
        addEdge("E_SH1_103_C1", "N_SH_103", "N_SH_CORR_1", 8f)
        addEdge("E_SH1_C1_CC", "N_SH_CORR_1", "N_SH_CORR_C", 20f)
        addEdge("E_SH1_CC_C2", "N_SH_CORR_C", "N_SH_CORR_2", 20f)
        addEdge("E_SH1_102_C2", "N_SH_102", "N_SH_CORR_2", 8f)
        addEdge("E_SH1_104_C2", "N_SH_104", "N_SH_CORR_2", 8f)
        addEdge("E_SH1_C2_EXIT", "N_SH_CORR_2", "N_SH_EXIT_1", 22f)

        // Inter-Building Walkways (Accessible pedestrian garden paths)
        addEdge("E_OUTDOOR_TP_SB", "N_TP_107", "N_SB_104", 45f, accessible = true)
        addEdge("E_OUTDOOR_TP_SH", "N_TP_107", "N_SH_104", 55f, accessible = true)
        addEdge("E_OUTDOOR_SB_SH", "N_SB_104", "N_SH_104", 40f, accessible = true)

        return edges
    }

    fun getInitialTimetable(): List<TimetableEntity> = listOf(
        TimetableEntity(
            subjectName = "Deep Learning & Neural Networks",
            courseCode = "AI-401",
            instructor = "Dr. Alan Murugan",
            roomId = "TP-103",
            buildingId = "TP",
            floorNumber = 1,
            dayOfWeek = "Monday",
            startTime = "09:00",
            endTime = "10:30"
        ),
        TimetableEntity(
            subjectName = "Computer Vision & Visual SLAM",
            courseCode = "CV-402",
            instructor = "Prof. Priya Chandran",
            roomId = "TP-104",
            buildingId = "TP",
            floorNumber = 1,
            dayOfWeek = "Monday",
            startTime = "11:00",
            endTime = "12:30"
        ),
        TimetableEntity(
            subjectName = "Advanced Algorithms & Optimization",
            courseCode = "CS-301",
            instructor = "Dr. Robert Vance",
            roomId = "TP-101",
            buildingId = "TP",
            floorNumber = 1,
            dayOfWeek = "Monday",
            startTime = "14:00",
            endTime = "15:30"
        ),
        TimetableEntity(
            subjectName = "Cybersecurity & Cryptography",
            courseCode = "SEC-305",
            instructor = "Prof. Marcus Brody",
            roomId = "TP-202",
            buildingId = "TP",
            floorNumber = 2,
            dayOfWeek = "Tuesday",
            startTime = "09:30",
            endTime = "11:00"
        ),
        TimetableEntity(
            subjectName = "Natural Language Processing (NLP)",
            courseCode = "AI-405",
            instructor = "Dr. Vikram Seth",
            roomId = "TP-201",
            buildingId = "TP",
            floorNumber = 2,
            dayOfWeek = "Wednesday",
            startTime = "10:00",
            endTime = "11:30"
        )
    )

    fun getInitialAnnouncements(): List<AnnouncementEntity> = listOf(
        AnnouncementEntity(
            title = "Annual AI & Robotics Hackathon 2026",
            content = "Registration is live for the 36-hour National Hackathon in Turing Auditorium (TP-105). Cash pool: \$10,000.",
            type = "EVENT",
            timestamp = System.currentTimeMillis() - 3600000L * 4,
            isCritical = false
        ),
        AnnouncementEntity(
            title = "Scheduled Corridor Floor Polishing Alert",
            content = "Corridor segment near AI Lab (TP-103) has temporary maintenance. Alternative route via Central Atrium active.",
            type = "CLOSURE",
            timestamp = System.currentTimeMillis() - 3600000L * 12,
            isCritical = true
        ),
        AnnouncementEntity(
            title = "Wheelchair Accessibility Ramp Upgrade Completed",
            content = "All entrances at Tech Park and Science Complex now feature tactile indicators and power-assisted doors.",
            type = "ALERT",
            timestamp = System.currentTimeMillis() - 3600000L * 24,
            isCritical = false
        )
    )

    fun getInitialEmergencyContacts(): List<EmergencyContactEntity> = listOf(
        EmergencyContactEntity(
            title = "Campus Security Control Room",
            role = "24/7 Security & Incident Dispatch",
            phoneNumber = "+1-800-555-0199",
            location = "Central Security Tower, Ground Floor",
            priority = 1
        ),
        EmergencyContactEntity(
            title = "Campus Medical Emergency Clinic",
            role = "Ambulance & Trauma Response",
            phoneNumber = "+1-800-555-0112",
            location = "Student Innovation Hub SH-103",
            priority = 1
        ),
        EmergencyContactEntity(
            title = "Campus Fire Safety Station",
            role = "Fire Evacuation & Hazard Control",
            phoneNumber = "+1-800-555-0101",
            location = "Campus Logistics Gate 3",
            priority = 2
        ),
        EmergencyContactEntity(
            title = "Women Safety & Student Helpline",
            role = "Confidential Safety Escort & Counseling",
            phoneNumber = "+1-800-555-0144",
            location = "Student Welfare Office SH-102",
            priority = 2
        )
    )

    fun getInitialCampusPhotos(): List<CampusPhotoEntity> = listOf(
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Main Academic Heritage Gate & Clock Tower",
            description = "Iconic north entrance of the campus with security check-in, visitor registration desk, and barrier-free tactile pedestrian path.",
            category = "CAMPUS_VIEW",
            photoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Tech & Engineering Park",
            roomOrArea = "Main Campus Gate"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Turing AI & Robotics Research Lab (TP-103)",
            description = "Equipped with 60 high-performance GPU workstations, quadruped robots, computer vision test beds, and collaborative research pods.",
            category = "LAB",
            photoUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Tech & Engineering Park",
            roomOrArea = "Room TP-103 (Floor 1)"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Central Digital Library & Quiet Study Pods",
            description = "Three floors of engineering volumes, international journal archives, high-speed Wi-Fi, and individual quiet study carrels.",
            category = "LIBRARY",
            photoUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Tech & Engineering Park",
            roomOrArea = "Room TP-203 (Floor 2)"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Dr. APJ Abdul Kalam Central Auditorium (TP-105)",
            description = "1,200-seat tiered acoustic auditorium with dual stage screens, assisted listening systems, and dedicated wheelchair viewing areas.",
            category = "AUDITORIUM",
            photoUrl = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Tech & Engineering Park",
            roomOrArea = "Room TP-105 (Floor 1)"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Smart Interactive Classroom 101",
            description = "Tiered collaborative classroom with dual 85-inch digital whiteboards, motorized projection, and ergonomic seating.",
            category = "CLASSROOM",
            photoUrl = "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Tech & Engineering Park",
            roomOrArea = "Room TP-101 (Floor 1)"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Green Quadrangle & Botanical Walkway",
            description = "Shaded courtyard connecting Tech Park to the Science Complex with solar benches and outdoor study pergolas.",
            category = "CAMPUS_VIEW",
            photoUrl = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Science & Research Complex",
            roomOrArea = "Central Academic Quadrangle"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "Campus Cafeteria & Student Dining Hub",
            description = "Multi-cuisine student and faculty dining center offering healthy meals, express counters, and outdoor patio seating.",
            category = "CAFETERIA",
            photoUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Student Innovation Hub",
            roomOrArea = "Room SH-101 (Floor 1)"
        ),
        CampusPhotoEntity(
            collegeId = "TECH_UNIVERSITY",
            title = "IoT & Hardware Makerspace Lab (SB-204)",
            description = "Circuit fabrication, 3D printing farm, laser cutters, oscilloscope stations, and embedded systems hardware development.",
            category = "LAB",
            photoUrl = "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80",
            uploadedBy = "Prof. K. Ramanathan (CEG Admin)",
            buildingName = "Science & Research Complex",
            roomOrArea = "Room SB-204 (Floor 2)"
        )
    )
}
