import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CropCalendarTask, TaskCategory, TaskPriority } from '../../types';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  CloudSun,
  Trash2,
  Edit2,
  Filter,
  Layers,
  X,
  Droplets,
  Sprout,
  Sparkles
} from 'lucide-react';

export const CropCalendarPage: React.FC = () => {
  const { tasks, addTask, updateTask, toggleTaskStatus, deleteTask, farms, language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CropCalendarTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<CropCalendarTask, 'id'>>({
    farmId: farms[0]?.id || 'farm-01',
    cropName: farms[0]?.currentCrop || (isHindi ? 'धान' : 'Paddy'),
    title: '',
    titleHi: '',
    description: '',
    descriptionHi: '',
    category: 'fertilizer',
    weekNumber: 14,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
    weatherDependent: false,
    weatherAdvice: '',
    weatherAdviceHi: ''
  });

  const categoryIcons: Record<TaskCategory, { label: string; icon: string }> = {
    sowing: { label: 'बुवाई', icon: '🌱' },
    irrigation: { label: 'सिंचाई', icon: '💧' },
    fertilizer: { label: 'उर्वरक/खाद', icon: '🧪' },
    pest_control: { label: 'कीट नियंत्रण', icon: '🛡️' },
    weeding: { label: 'निराई-गुड़ाई', icon: '🌾' },
    harvest: { label: 'कटाई', icon: '🚜' }
  };

  const handleOpenAdd = () => {
    setFormData({
      farmId: farms[0]?.id || 'farm-01',
      cropName: farms[0]?.currentCrop || (isHindi ? 'धान' : 'Paddy'),
      title: '',
      titleHi: '',
      description: '',
      descriptionHi: '',
      category: 'fertilizer',
      weekNumber: 14,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      weatherDependent: false
    });
    setEditingTask(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: CropCalendarTask) => {
    setEditingTask(task);
    setFormData({
      farmId: task.farmId,
      cropName: task.cropName,
      title: task.title,
      titleHi: task.titleHi,
      description: task.description,
      descriptionHi: task.descriptionHi,
      category: task.category,
      weekNumber: task.weekNumber,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      weatherDependent: task.weatherDependent,
      weatherAdvice: task.weatherAdvice,
      weatherAdviceHi: task.weatherAdviceHi
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleHi.trim() && !formData.title.trim()) {
      alert('कृपया कार्य का शीर्षक दर्ज करें');
      return;
    }

    const payload = {
      ...formData,
      title: formData.title || formData.titleHi,
      titleHi: formData.titleHi || formData.title,
      description: formData.description || formData.descriptionHi,
      descriptionHi: formData.descriptionHi || formData.description
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }
    setIsAddModalOpen(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedFarmId !== 'all' && t.farmId !== selectedFarmId) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'व्यक्तिगत फसल कैलेंडर' : 'Personalized Crop Calendar'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isHindi
              ? 'बुवाई से कटाई तक प्रत्येक सप्ताह के महत्वपूर्ण कार्य, सिंचाई, खाद व कीट निगरानी'
              : 'Key weekly farm tasks from sowing to harvest: irrigation, fertilization and pest management'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नया कार्य जोड़ें</span>
        </button>
      </div>

      {/* Filter Strip: Farm Selector & Category Chips */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Farm selector dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">खेत चुनें:</span>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-[#087A43]"
            >
              <option value="all">सभी पंजीकृत खेत ({tasks.length} कार्य)</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.currentCrop})</option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
              लंबित: {pendingCount}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              पूर्ण: {completedCount}
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#087A43] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            सभी श्रेणियां
          </button>
          {Object.entries(categoryIcons).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                selectedCategory === key
                  ? 'bg-[#087A43] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{val.icon}</span>
              <span>{val.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">कोई कार्य नहीं मिला</h3>
            <p className="text-xs text-gray-500 mt-1">
              इस फ़िल्टर के लिए कोई अनुसूचित कार्य मौजूद नहीं है।
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const catInfo = categoryIcons[task.category] || { label: 'सामान्य', icon: '📝' };

            const priorityBadge = {
              high: 'bg-rose-100 text-rose-800 border-rose-200',
              medium: 'bg-amber-100 text-amber-800 border-amber-200',
              low: 'bg-blue-100 text-blue-800 border-blue-200'
            }[task.priority];

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                    : 'border-[#E5EBE1]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="p-1 text-gray-400 hover:text-[#087A43] transition-colors mt-0.5 shrink-0 cursor-pointer"
                    title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-[#087A43] fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-[#087A43]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge}`}>
                        {task.priority === 'high' ? 'अति महत्वपूर्ण' : task.priority === 'medium' ? 'मध्यम' : 'सामान्य'}
                      </span>

                      <span className="text-[11px] text-gray-500 font-medium">
                        सप्ताह {task.weekNumber} • {task.cropName}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold text-gray-900 leading-snug ${
                      isCompleted ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.titleHi || task.title}
                    </h3>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {task.descriptionHi || task.description}
                    </p>

                    {/* Weather dependent note */}
                    {task.weatherDependent && (
                      <div className="mt-2 text-[11px] text-sky-800 bg-sky-50 p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                        <CloudSun className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>मौसम टिप: {task.weatherAdviceHi || 'मौसम साफ होने पर ही छिड़काव करें।'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Due Date & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-gray-400 block font-medium">नियत तारीख</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#087A43]" />
                <span>{editingTask ? 'कार्य विवरण संपादित करें' : 'कैलेंडर में नया कार्य जोड़ें'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">कार्य का शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={formData.titleHi}
                  onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                  placeholder="उदा. पोटाश का दूसरा छिड़काव"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">संबंधित खेत</label>
                  <select
                    value={formData.farmId}
                    onChange={(e) => {
                      const selected = farms.find(f => f.id === e.target.value);
                      setFormData({
                        ...formData,
                        farmId: e.target.value,
                        cropName: selected?.currentCrop || formData.cropName
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">श्रेणी</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="fertilizer">{isHindi ? 'उर्वरक / खाद' : 'Fertilizer'}</option>
                    <option value="irrigation">{isHindi ? 'सिंचाई' : 'Irrigation'}</option>
                    <option value="pest_control">{isHindi ? 'कीट व रोग नियंत्रण' : 'Pest Control'}</option>
                    <option value="weeding">{isHindi ? 'निराई-गुड़ाई' : 'Weeding'}</option>
                    <option value="harvest">{isHindi ? 'कटाई तैयारी' : 'Harvest'}</option>
                    <option value="sowing">{isHindi ? 'बुवाई / रोपाई' : 'Sowing'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'नियत तारीख' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'प्राथमिकता' : 'Priority'}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="high">{isHindi ? 'अति महत्वपूर्ण' : 'High'}</option>
                    <option value="medium">{isHindi ? 'मध्यम' : 'Medium'}</option>
                    <option value="low">{isHindi ? 'सामान्य' : 'Low'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">विस्तृत विवरण</label>
                <textarea
                  rows={2}
                  value={formData.descriptionHi}
                  onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
                  placeholder="उदा. प्रति एकड़ 15 किग्रा पोटाश और 20 किग्रा यूरिया डालें..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              {/* Weather dependent toggle */}
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weatherDependent}
                    onChange={(e) => setFormData({ ...formData, weatherDependent: e.target.checked })}
                    className="w-4 h-4 text-[#087A43] rounded"
                  />
                  <span className="text-xs font-bold text-sky-950">मौसम पर आधारित कार्य</span>
                </label>

                {formData.weatherDependent && (
                  <input
                    type="text"
                    value={formData.weatherAdviceHi || ''}
                    onChange={(e) => setFormData({ ...formData, weatherAdviceHi: e.target.value })}
                    placeholder="उदा. तेज हवा या बारिश की संभावना न हो तभी छिड़काव करें"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-sky-200 bg-white"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!taskToDelete}
        title="कार्य हटाएं?"
        message="क्या आप वाकई इस कार्य को फसल कैलेंडर से हटाना चाहते हैं?"
        confirmLabel="हां, हटाएं"
        cancelLabel="रद्द करें"
        isDestructive
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
