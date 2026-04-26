import { Component } from "@odoo/owl";

export class ProjectForm extends Component {

    static props = {
        state: Object,
        users: Array,
        hideProjectForm:Function,
        saveProject:Function,


    };
}

// 🔥 IMPORTANT LINE (TON BUG)
ProjectForm.template = "society_management.project_form";