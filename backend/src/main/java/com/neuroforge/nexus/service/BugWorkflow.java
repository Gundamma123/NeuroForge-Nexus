package com.neuroforge.nexus.service;

import java.util.List;

public final class BugWorkflow {

    private BugWorkflow() {}

    public static final List<String> STATUSES =
            List.of("New", "Triaged", "Assigned", "In Progress", "Fixed", "Retest", "Closed");
    public static final List<String> SEVERITIES = List.of("Low", "Medium", "High", "Critical");
    public static final List<String> PRIORITIES = List.of("Low", "Medium", "High");
    public static final List<String> ENVIRONMENTS = List.of("Development", "Staging", "Production");

    // A bug moves one step forward or back along the timeline.
    // Extra rule: a failed retest goes straight back to "In Progress".
    public static boolean canMove(String from, String to) {
        int a = STATUSES.indexOf(from);
        int b = STATUSES.indexOf(to);
        if (a < 0 || b < 0) return false;
        if (Math.abs(a - b) == 1) return true;
        return "Retest".equals(from) && "In Progress".equals(to);
    }
}