import { useEffect, useState } from "react";
import Navbar from "../custom/navbar";
import TaskCard from "../custom/task-card";
import { Accordion } from "../ui/accordion";
import { createTask, fetchProjects, fetchTasks } from "@/redux/taskSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { Plus } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DayPicker } from "react-day-picker";
import { Checkbox } from "../ui/checkbox";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export default function Tasks() {
    const tasks = useSelector((state: RootState) => state.task.tasks);
    const projects = useSelector((state: RootState) => state.task.projects);
    let loading = useSelector((state: RootState) => state.task.loading);
    const dispatch: AppDispatch = useDispatch();
    const { toast } = useToast();

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [duration, setDuration] = useState<string>("00:00");
    const [projectString, setProjectString] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());
    const [checked, setChecked] = useState<boolean>(false);

    useEffect(() => {
        dispatch(fetchTasks(1));
        dispatch(fetchProjects(1));
    }, []);

    const handleCreation = async () => {
        const taskDto = {
            title: title,
            description: description,
            date: date,
            duration: convertHHMMToMinutes(duration),
            appraisalStatus: checked ? "PENDING" : "DID_NOT_APPLY",
            projectId: Number(projectString.split(':')[0]),
            projectName: projectString.split(':')[1]
        }

        try {
            loading = true;
            await fetchWithAuth("http://localhost:8080/api/v1/tasks/1", {
                method: "POST",
                body: JSON.stringify(taskDto)
            });
            dispatch(createTask(taskDto));
            toast({
                title: "Task Creation Successful"
            });
        }
        catch(error) {
            console.log(error);
            toast({
                title: "Something went wrong. Cannot create task"
            });
        }
        finally {
            loading = false;
        }
    }

    function convertHHMMToMinutes(time: string): number {
        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        return hours * 60 + minutes;
    }

    const handleCloseDialog = () => {
        setTitle("");
        setDescription("");
        setDuration("00:00");
        setProjectString("");
        setDate(new Date());
        setChecked(false);
    }

    return (
        <div>
            <Toaster />
            <Navbar />
            <div className="px-2 py-2 sm:px-20 sm:py-10">
                <p className="text-2xl font-bold mb-5">Tasks</p>
                {
                    loading ? (
                        <div>Loading...</div>
                    ) : (
                        <Accordion type="multiple" className="w-full">
                            {
                                tasks?.map((task, index) => (
                                    <TaskCard key={ task.id } value={ `value-${ index + 1 }` } task={ task } projects={ projects } />
                                ))
                            }
                        </Accordion>
                    )
                }
                {
                    !loading && <Dialog onOpenChange={ open => !open && handleCloseDialog() }>
                        <DialogTrigger asChild>
                            <Button className="fixed bottom-10 right-10 rounded-md" size="sm"><Plus />Add Task</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[920px]">
                            <DialogHeader>
                                <DialogTitle>Add Task</DialogTitle>
                                <DialogDescription></DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-2 w-full">
                                <div className="flex flex-col justify-around">
                                    <div>
                                        <Label htmlFor="title-modal-textField">Title</Label>
                                        <Input id="title-modal-textField" value={ title } onChange={ event => setTitle(event.target.value) } />
                                    </div>
                                    <div>
                                        <Label htmlFor="description-modal-textArea">Description</Label>
                                        <Textarea id="description-modal-textArea" className="resize-none" rows={ 5 } value={ description } onChange={ event => setDescription(event.target.value) } />
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <Label htmlFor="duration-modal-timePicker">Duration (HH : MM)</Label>
                                            <input id="duration-modal-timePicker" className="block border border-input shadow-sm px-2 h-8 text-primary bg-transparent rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" aria-label="Time" type="time" value={ duration } onChange={ event => setDuration(event.target.value) } />
                                        </div>
                                        <div>
                                            <Label htmlFor="project-modal-dropdown">Project</Label>
                                            <select id="project-modal-dropdown" className="block border border-input shadow-sm px-2 h-8 text-primary bg-transparent rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={ projectString } onChange={ event => setProjectString(event.target.value) }>
                                                <option value="">Choose a project</option>
                                                {
                                                    projects && projects.map(project => {
                                                        return <option key={ project.id } value={ `${ project.id }:${ project.name }` }>{ project.name }</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <DayPicker mode="single" selected={ date } onSelect={ setDate } defaultMonth={ new Date() } />
                                </div>
                            </div>

                            <DialogFooter>
                                <div className="flex justify-between w-full">
                                    <div className="flex items-center gap-1">
                                        <Checkbox id="checkbox-modal" checked={ checked } onClick={ () => setChecked(!checked) } />
                                        <Label htmlFor="checkbox-modal">Mark for Appraisal</Label>
                                    </div>
                                    <DialogClose>
                                        <Button onClick={ handleCreation }>Create Task</Button>
                                    </DialogClose>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            </div>
        </div>
    );
}
