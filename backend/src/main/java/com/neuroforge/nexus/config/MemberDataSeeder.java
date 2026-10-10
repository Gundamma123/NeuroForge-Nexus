package com.neuroforge.nexus.config;

import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds 100 synthetic, non-real member profiles (20 per role category) on first
 * startup only. Runs once — if the members table already has data, it does nothing,
 * so restarting the backend never creates duplicates.
 */
@Component
public class MemberDataSeeder implements CommandLineRunner {

    private final MemberRepository memberRepository;

    public MemberDataSeeder(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public void run(String... args) {
        if (memberRepository.count() > 0) {
            return; // already seeded
        }

        List<Member> members = new ArrayList<>();
        members.addAll(buildCategory("Frontend Developer", FRONTEND_NAMES, FRONTEND_SKILLS));
        members.addAll(buildCategory("Backend Developer", BACKEND_NAMES, BACKEND_SKILLS));
        members.addAll(buildCategory("Full Stack Developer", FULLSTACK_NAMES, FULLSTACK_SKILLS));
        members.addAll(buildCategory("Product Manager", PM_NAMES, PM_SKILLS));
        members.addAll(buildCategory("QA Tester", QA_NAMES, QA_SKILLS));

        memberRepository.saveAll(members);
        System.out.println("MemberDataSeeder: seeded " + members.size() + " synthetic member records.");
    }

    private List<Member> buildCategory(String role, String[] names, String[] skillPool) {
        List<Member> list = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            Member m = new Member();
            m.setName(names[i]);
            m.setEmail(toEmail(names[i]));
            m.setRole(role);
            m.setExperienceYears((i % 8) + 1);
            m.setSkills(skillPool[i % skillPool.length]);
            m.setAvailability(i % 2 == 0 ? "Available" : "Busy");
            list.add(m);
        }
        return list;
    }

    private String toEmail(String fullName) {
        return fullName.toLowerCase().replace(" ", ".").replace("'", "") + "@neuroforge-demo.io";
    }

    private static final String[] FRONTEND_NAMES = {
            "Rahul Sharma", "Ananya Rao", "Kevin Chen", "Priya Nair", "Daniel Kim",
            "Fatima Khan", "Aditya Verma", "Sophia Martinez", "Ibrahim Yusuf", "Neha Kapoor",
            "Lucas Silva", "Meera Iyer", "Ethan Brown", "Divya Menon", "Ryan O'Connor",
            "Kavya Reddy", "Noah Wilson", "Sneha Pillai", "Marcus Johnson", "Ria Chatterjee"
    };
    private static final String[] FRONTEND_SKILLS = {
            "React, JavaScript, HTML, CSS",
            "Vue.js, TypeScript, Sass",
            "Angular, RxJS, TypeScript",
            "React, Redux, Tailwind CSS",
            "HTML, CSS, JavaScript, Next.js"
    };

    private static final String[] BACKEND_NAMES = {
            "Arjun Mehta", "Wei Chen", "Sara Iqbal", "Diego Ruiz", "Vikram Singh",
            "Elena Petrova", "Karan Malhotra", "Grace Park", "Rohan Deshpande", "Amara Okafor",
            "Tejas Kulkarni", "Isabella Rossi", "Suresh Pillai", "Omar Farouk", "Ananth Rajan",
            "Lina Zhou", "Manish Tiwari", "Chloe Dubois", "Harsh Vardhan", "Nadia Hassan"
    };
    private static final String[] BACKEND_SKILLS = {
            "Java, Spring Boot, MySQL",
            "Node.js, Express, MongoDB",
            "Python, Django, PostgreSQL",
            "Java, Hibernate, REST APIs",
            "Go, gRPC, Redis"
    };

    private static final String[] FULLSTACK_NAMES = {
            "Aakash Jain", "Mia Thompson", "Siddharth Rao", "Yuki Tanaka", "Pranav Bhatt",
            "Camila Fernandez", "Rajesh Kumar", "Olivia Bennett", "Sahil Chopra", "Zara Ahmed",
            "Nikhil Bansal", "Emma Roberts", "Varun Saxena", "Aisha Mohammed", "Akhil Reddy",
            "Hana Kobayashi", "Deepak Nair", "Julia Santos", "Sameer Sheikh", "Priyanka Das"
    };
    private static final String[] FULLSTACK_SKILLS = {
            "React, Node.js, MongoDB",
            "Java, React, MySQL",
            "Angular, Spring Boot, PostgreSQL",
            "Vue.js, Express, MySQL",
            "React, Django, PostgreSQL"
    };

    private static final String[] PM_NAMES = {
            "Alok Mishra", "Hannah Miller", "Vivek Anand", "Layla Aziz", "Karthik Subramanian",
            "Natasha Volkov", "Sanjay Gupta", "Amy Zhang", "Rakesh Yadav", "Sofia Moreno",
            "Anil Kapoor", "Rachel Cohen", "Manoj Tiwari", "Ingrid Larsen", "Girish Rao",
            "Yasmin Malik", "Pankaj Joshi", "Bianca Ferreira", "Ashwin Pillai", "Clara Nilsson"
    };
    private static final String[] PM_SKILLS = {
            "Roadmapping, Agile, JIRA",
            "Stakeholder Management, Scrum, Analytics",
            "Agile, User Research, Roadmapping",
            "Product Strategy, A/B Testing, JIRA",
            "Scrum, Backlog Management, Analytics"
    };

    private static final String[] QA_NAMES = {
            "Ramesh Babu", "Lily Adams", "Naveen Kumar", "Grace Lee", "Suraj Patil",
            "Marta Novak", "Vishal Agarwal", "Ella Fischer", "Dinesh Reddy", "Poonam Shah",
            "Gaurav Sethi", "Freya Andersen", "Kiran Rathi", "Maya Cohen", "Abhinav Sinha",
            "Zoe Wright", "Tarun Mehra", "Anita George", "Rohit Bhalla", "Leah Novak"
    };
    private static final String[] QA_SKILLS = {
            "Selenium, JIRA, Manual Testing",
            "Cypress, API Testing, Postman",
            "JUnit, TestNG, Automation",
            "Manual Testing, Regression, JIRA",
            "Selenium, Cypress, CI/CD Testing"
    };
}