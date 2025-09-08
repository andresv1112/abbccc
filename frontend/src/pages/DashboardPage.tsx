import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { routineService } from '../services/routineService';
import { workoutService } from '../services/workoutService';
import { Dumbbell, CalendarCheck, Clock, TrendingUp, List, PlusCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [routineStats, setRoutineStats] = useState<any>(null);
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return; // Espera a que la autenticación cargue

      try {
        setIsLoading(true);
        setError('');

        // Realiza todas las llamadas a la API en paralelo para mejorar el rendimiento
        const [
          routineStatsData,
          workoutStatsData,
          recentWorkoutsData
        ] = await Promise.all([
          routineService.getStats(),
          workoutService.getStats(),
          workoutService.getRecentWorkouts()
        ]);

        setRoutineStats(routineStatsData);
        setWorkoutStats(workoutStatsData);
        setRecentWorkouts(recentWorkoutsData);

      } catch (err: any) {
        console.error('Error al cargar los datos del dashboard:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]); // Vuelve a cargar si el usuario cambia o el estado de autenticación carga

  // Función auxiliar para formatear la duración de los entrenamientos
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Muestra un spinner de carga mientras se autentica o se cargan los datos
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Muestra un mensaje de error si algo falla al cargar los datos
  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Bienvenido, {user?.username}!
      </h1>

      {/* Sección de estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta: Rutinas Creadas */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <Dumbbell className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rutinas Creadas</p>
            <p className="text-2xl font-semibold text-gray-900">{routineStats?.totalRoutines || 0}</p>
          </div>
        </div>

        {/* Tarjeta: Entrenamientos Completados */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CalendarCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Entrenamientos Completados</p>
            <p className="text-2xl font-semibold text-gray-900">{workoutStats?.completedWorkouts || 0}</p>
          </div>
        </div>

        {/* Tarjeta: Duración Promedio */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Duración Promedio</p>
            <p className="text-2xl font-semibold text-gray-900">{workoutStats?.avgDurationMinutes ? `${workoutStats.avgDurationMinutes} min` : 'N/A'}</p>
          </div>
        </div>

        {/* Tarjeta: Total Series */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <List className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Series</p>
            <p className="text-2xl font-semibold text-gray-900">{workoutStats?.totalSets || 0}</p>
          </div>
        </div>

        {/* Tarjeta: Peso Total Levantado */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Peso Total Levantado</p>
            <p className="text-2xl font-semibold text-gray-900">{workoutStats?.totalWeightLifted ? `${workoutStats.totalWeightLifted.toFixed(0)} kg` : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/routines/new" className="btn-primary flex items-center justify-center py-3">
              <PlusCircle className="h-5 w-5 mr-2" />
              Crear Nueva Rutina
            </Link>
            <Link to="/routines" className="btn-secondary flex items-center justify-center py-3">
              <List className="h-5 w-5 mr-2" />
              Ver Mis Rutinas
            </Link>
            <Link to="/workouts" className="btn-secondary flex items-center justify-center py-3">
              <History className="h-5 w-5 mr-2" />
              Ver Historial
            </Link>
          </div>
        </div>

        {/* Sección de Últimos Entrenamientos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Últimos Entrenamientos</h2>
          {recentWorkouts.length > 0 ? (
            <ul className="space-y-3">
              {recentWorkouts.map((workout) => (
                <li key={workout.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <Link to={`/workouts/${workout.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-md">
                    <p className="text-md font-medium text-gray-800">{workout.routineName}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(workout.startedAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                      {' '}
                      {workout.isCompleted ? `(${formatDuration(workout.duration)})` : '(En progreso)'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {workout.exercises.join(', ')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay entrenamientos recientes. ¡Empieza a entrenar!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;