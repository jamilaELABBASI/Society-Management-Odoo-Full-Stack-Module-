/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";

class ProjectDashboard extends Component {}

ProjectDashboard.template = "society_management.project_dashboard";

registry.category("actions").add("project_dashboard_tag", ProjectDashboard);









