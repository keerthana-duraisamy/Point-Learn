import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Course, Evaluation } from '../types';
import { SAMPLE_PREVIEW_COURSES } from '../utils/previewDemoCourses';

import { handleFirestoreError, OperationType } from '../utils/firestoreError';

const LOCAL_STORAGE_COURSES_KEY = 'point_learn_local_courses';

function getLocalCourses(): Course[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SAMPLE_PREVIEW_COURSES;
}

function saveLocalCourses(courses: Course[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(courses));
  } catch {}
}

export const createUserProfile = async (uid: string, name: string, email: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
};

export const saveCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'completedLessons' | 'progress'>) => {
  if (courseData.userId.includes('preview-demo')) {
    const localCourses = getLocalCourses();
    const newCourse: Course = {
      ...courseData,
      id: 'course-' + Date.now(),
      createdAt: new Date().toISOString(),
      completedLessons: [],
      progress: 0,
    };
    saveLocalCourses([newCourse, ...localCourses]);
    return newCourse.id;
  }

  try {
    const docRef = await addDoc(collection(db, 'users', courseData.userId, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      completedLessons: [],
      progress: 0
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${courseData.userId}/courses`);
  }
};

export const getUserCourses = async (userId: string) => {
  if (userId.includes('preview-demo')) {
    return getLocalCourses();
  }

  try {
    const q = query(collection(db, 'users', userId, 'courses'));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    return results.length > 0 ? results : getLocalCourses();
  } catch (error) {
    console.warn('Falling back to preview courses:', error);
    return getLocalCourses();
  }
};

export const getCourse = async (userId: string, courseId: string): Promise<Course | null> => {
  if (userId.includes('preview-demo') || courseId.startsWith('demo-') || courseId.startsWith('course-')) {
    const local = getLocalCourses().find(c => c.id === courseId);
    if (local) return local;
  }

  try {
    const docRef = doc(db, 'users', userId, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    return getLocalCourses().find(c => c.id === courseId) || null;
  } catch (error) {
    return getLocalCourses().find(c => c.id === courseId) || null;
  }
};

export const deleteCourse = async (userId: string, courseId: string) => {
  if (userId.includes('preview-demo')) {
    const remaining = getLocalCourses().filter(c => c.id !== courseId);
    saveLocalCourses(remaining);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'courses', courseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/courses/${courseId}`);
  }
};

export const markLessonCompleted = async (userId: string, courseId: string, lessonId: string) => {
  if (userId.includes('preview-demo') || courseId.startsWith('demo-')) {
    const courses = getLocalCourses();
    const updated = courses.map(course => {
      if (course.id === courseId) {
        const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
        const lessons = course.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l);
        const completed = new Set(course.completedLessons || []);
        if (lessonIndex !== -1) completed.add(lessonIndex);
        const completedArr = Array.from(completed);
        const progress = Math.round((completedArr.length / lessons.length) * 100);
        return { ...course, lessons, completedLessons: completedArr, progress };
      }
      return course;
    });
    saveLocalCourses(updated);
    return;
  }

  try {
    const courseRef = doc(db, 'users', userId, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data() as Course;
      const lessonIndex = course.lessons.findIndex((l: any) => l.id === lessonId);
      
      if (lessonIndex !== -1) {
        const lessons = course.lessons.map((l: any) => 
          l.id === lessonId ? { ...l, completed: true } : l
        );
        
        const completedLessons = [...(course.completedLessons || [])];
        if (!completedLessons.includes(lessonIndex)) {
          completedLessons.push(lessonIndex);
        }
        
        const progress = Math.round((completedLessons.length / lessons.length) * 100);
        
        await updateDoc(courseRef, { 
          lessons,
          completedLessons,
          progress
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/courses/${courseId}`);
  }
};

export const saveEvaluation = async (evaluationData: Omit<Evaluation, 'timestamp'>) => {
  try {
    await addDoc(collection(db, 'evaluations'), {
      ...evaluationData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'evaluations');
  }
};

export const getUserEvaluations = async (userId: string) => {
  try {
    const q = query(collection(db, 'evaluations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'evaluations');
  }
};
