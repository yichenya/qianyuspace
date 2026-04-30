import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '../types';

// 项目状态接口
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: Project | null) => void;
}

// 创建项目状态管理
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [project, ...state.projects]
      })),
      updateProject: (updatedProject) => set((state) => ({
        projects: state.projects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        ),
        currentProject: state.currentProject?.id === updatedProject.id 
          ? updatedProject 
          : state.currentProject
      })),
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter(project => project.id !== projectId),
        currentProject: state.currentProject?.id === projectId 
          ? null 
          : state.currentProject
      })),
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    {
      name: 'project-storage',
    }
  )
);
