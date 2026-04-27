/** @odoo-module **/

import { Component } from "@odoo/owl";
import {TaskForm} from "../task_dashboard/task_form/task_form";

export class ProjectView extends Component {
    static template = "society_management.project_view";
    static components = { TaskForm };


    static props={
        state:Object,
        tasks:Array,
        showTaskForm:Function,
        hideTaskForm:Function,
        saveTask:Function,
        editTask:Function,
        deleteTask:Function,
        setTaskFilter:Function,
        taskStats:Object



    }

}