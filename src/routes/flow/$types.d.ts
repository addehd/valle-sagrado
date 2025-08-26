export interface FlowTask {
	id: string;
	column_id: string;
	board_id: string;
	title: string;
	description?: string;
	position: number;
	priority: 'low' | 'medium' | 'high';
	due_date?: string;
	created_at: string;
	updated_at: string;
}

export interface FlowColumn {
	id: string;
	board_id: string;
	title: string;
	position: number;
	color: string;
	created_at: string;
	updated_at: string;
	flow_tasks?: FlowTask[];
}

export interface FlowBoard {
	id: string;
	user_id: string;
	title: string;
	description?: string;
	created_at: string;
	updated_at: string;
	flow_columns?: FlowColumn[];
}

export interface PageData {
	boards: FlowBoard[];
}

export interface ActionData {
	success?: boolean;
	message?: string;
	task?: FlowTask;
}
