// //// src/app/dashboard/admin/articulos/page.tsx
//  "use client"
// import React, { useState, useEffect, useRef } from 'react';
// import { supabase } from '@/lib/supabase';
// import { 
//   Package, 
//   Upload, 
//   Edit, 
//   Trash2, 
//   Plus, 
//   Search, 
//   Filter,
//   Image,
//   AlertTriangle,
//   Save,
//   X,
//   Eye
// } from 'lucide-react';

// // Tipos para TypeScript
// interface Article {
//   id: string;
//   codigo: string;
//   nombre: string;
//   descripcion?: string;
//   categoria_id?: string;
//   proveedor_id?: string;
//   ubicacion_id?: string;
//   precio_unitario: number;
//   stock_minimo: number;
//   stock_actual: number;
//   unidad_medida: string;
//   estado: 'ACTIVO' | 'INACTIVO' | 'OBSOLETO';
//   fecha_vencimiento?: string;
//   imagen_url?: string;
//   observaciones?: string;
// }

// interface Category {
//   id: string;
//   nombre: string;
//   codigo: string;
// }

// interface Provider {
//   id: string;
//   nombre: string;
//   ruc: string;
// }

// interface Location {
//   id: string;
//   nombre: string;
//   codigo: string;
// }

// export default function ArticlesManagement() {
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [providers, setProviders] = useState<Provider[]>([]);
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingArticle, setEditingArticle] = useState<Article | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   const [formData, setFormData] = useState<Partial<Article>>({
//     codigo: '',
//     nombre: '',
//     descripcion: '',
//     precio_unitario: 0,
//     stock_minimo: 0,
//     stock_actual: 0,
//     unidad_medida: 'UNIDAD',
//     estado: 'ACTIVO',
//     observaciones: ''
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [articlesRes, categoriesRes, providersRes, locationsRes] = await Promise.all([
//         supabase.from('articulos').select(`
//           *,
//           categorias(nombre),
//           proveedores(nombre),
//           ubicaciones(nombre)
//         `).order('created_at', { ascending: false }),
//         supabase.from('categorias').select('*'),
//         supabase.from('proveedores').select('*'),
//         supabase.from('ubicaciones').select('*')
//       ]);

//       if (articlesRes.data) setArticles(articlesRes.data as Article[]);
//       if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
//       if (providersRes.data) setProviders(providersRes.data as Provider[]);
//       if (locationsRes.data) setLocations(locationsRes.data as Location[]);
//     } catch (error) {
//       console.error('Error cargando datos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Upload de imagen a Supabase Storage
//   const uploadImage = async (file: File): Promise<string | null> => {
//     try {
//       setUploadingImage(true);
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
//       const filePath = `articulos/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('inventario-images')
//         .upload(filePath, file);

//       if (uploadError) {
//         throw uploadError;
//       }

//       // Obtener URL pública
//       const { data } = supabase.storage
//         .from('inventario-images')
//         .getPublicUrl(filePath);

//       return data.publicUrl;
//     } catch (error) {
//       console.error('Error subiendo imagen:', error);
//       return null;
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // Validar tipo de archivo
//     if (!file.type.startsWith('image/')) {
//       alert('Por favor selecciona una imagen válida');
//       return;
//     }

//     // Validar tamaño (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       alert('La imagen debe ser menor a 5MB');
//       return;
//     }

//     const imageUrl = await uploadImage(file);
//     if (imageUrl) {
//       setFormData(prev => ({ ...prev, imagen_url: imageUrl }));
//     } else {
//       alert('Error al subir la imagen');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       const user = await supabase.auth.getUser();
//       if (!user.data.user) throw new Error('No autenticado');

//       const dataToSave = {
//         ...formData,
//         created_by: user.data.user.id,
//         updated_by: user.data.user.id
//       };

//       if (editingArticle) {
//         // Actualizar
//         const { error } = await supabase
//           .from('articulos')
//           .update(dataToSave)
//           .eq('id', editingArticle.id);
        
//         if (error) throw error;
//       } else {
//         // Crear nuevo
//         const { error } = await supabase
//           .from('articulos')
//           .insert(dataToSave);
        
//         if (error) throw error;
//       }

//       setShowModal(false);
//       setFormData({});
//       setEditingArticle(null);
//       loadData();
      
//     } catch (error) {
//       console.error('Error guardando artículo:', error);
//       alert('Error al guardar el artículo');
//     }
//   };

//   const handleEdit = (article: Article) => {
//     setEditingArticle(article);
//     setFormData(article);
//     setShowModal(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
//     try {
//       const { error } = await supabase
//         .from('articulos')
//         .delete()
//         .eq('id', id);
      
//       if (error) throw error;
//       loadData();
//     } catch (error) {
//       console.error('Error eliminando artículo:', error);
//       alert('Error al eliminar el artículo');
//     }
//   };

//   // Filtrar artículos
//   const filteredArticles = articles.filter(article => {
//     const matchesSearch = article.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          article.codigo.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = !selectedCategory || article.categoria_id === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//                 <Package className="w-8 h-8 text-blue-600 mr-3" />
//                 Gestión de Artículos
//               </h1>
//               <p className="text-gray-600 mt-1">Administra el inventario de artículos</p>
//             </div>
//             <button
//               onClick={() => {
//                 setEditingArticle(null);
//                 setFormData({});
//                 setShowModal(true);
//               }}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
//             >
//               <Plus className="w-4 h-4" />
//               <span>Nuevo Artículo</span>
//             </button>
//           </div>
//         </div>

//         {/* Filtros */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Buscar por nombre o código..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">Todas las categorías</option>
//               {categories.map(cat => (
//                 <option key={cat.id} value={cat.id}>{cat.nombre}</option>
//               ))}
//             </select>

//             <div className="text-sm text-gray-600 flex items-center">
//               <Filter className="w-4 h-4 mr-2" />
//               {filteredArticles.length} artículos encontrados
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabla de Artículos */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Imagen
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Código / Nombre
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Stock
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Precio
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estado
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredArticles.map((article) => (
//                 <tr key={article.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {article.imagen_url ? (
//                       <img
//                         src={article.imagen_url}
//                         alt={article.nombre}
//                          width={128}
//                          height={128}
//                         className="w-12 h-12 rounded-lg object-cover"
//                       />
//                     ) : (
//                       <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
//                         <Image className="w-6 h-6 text-gray-400" />
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">{article.nombre}</div>
//                       <div className="text-sm text-gray-500">{article.codigo}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {article.stock_actual} / {article.stock_minimo}
//                     </div>
//                     <div className="text-xs text-gray-500">{article.unidad_medida}</div>
//                     {article.stock_actual <= article.stock_minimo && (
//                       <div className="flex items-center text-red-600 text-xs mt-1">
//                         <AlertTriangle className="w-3 h-3 mr-1" />
//                         Stock Bajo
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     S/ {article.precio_unitario.toFixed(2)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       article.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
//                       article.estado === 'INACTIVO' ? 'bg-gray-100 text-gray-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {article.estado}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleEdit(article)}
//                         className="text-blue-600 hover:text-blue-900"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(article.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal para Crear/Editar Artículo */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowModal(false);
//                     setFormData({});
//                     setEditingArticle(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Código */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Código *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.codigo || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Ej: ART001"
//                   />
//                 </div>

//                 {/* Nombre */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Nombre *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.nombre || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Nombre del artículo"
//                   />
//                 </div>

//                 {/* Categoría */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Categoría
//                   </label>
//                   <select
//                     value={formData.categoria_id || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Seleccionar categoría</option>
//                     {categories.map(cat => (
//                       <option key={cat.id} value={cat.id}>{cat.nombre}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Proveedor */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Proveedor
//                   </label>
//                   <select
//                     value={formData.proveedor_id || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, proveedor_id: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Seleccionar proveedor</option>
//                     {providers.map(prov => (
//                       <option key={prov.id} value={prov.id}>{prov.nombre}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Ubicación */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Ubicación
//                   </label>
//                   <select
//                     value={formData.ubicacion_id || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_id: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Seleccionar ubicación</option>
//                     {locations.map(loc => (
//                       <option key={loc.id} value={loc.id}>{loc.nombre}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Precio Unitario */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Precio Unitario (S/)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={formData.precio_unitario || 0}
//                     onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: parseFloat(e.target.value) || 0 }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Stock Actual */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Stock Actual
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={formData.stock_actual || 0}
//                     onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: parseInt(e.target.value) || 0 }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Stock Mínimo */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Stock Mínimo
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={formData.stock_minimo || 0}
//                     onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: parseInt(e.target.value) || 0 }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Unidad de Medida */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Unidad de Medida
//                   </label>
//                   <select
//                     value={formData.unidad_medida || 'UNIDAD'}
//                     onChange={(e) => setFormData(prev => ({ ...prev, unidad_medida: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="UNIDAD">Unidad</option>
//                     <option value="KG">Kilogramos</option>
//                     <option value="LITROS">Litros</option>
//                     <option value="METROS">Metros</option>
//                     <option value="CAJAS">Cajas</option>
//                     <option value="PAQUETES">Paquetes</option>
//                   </select>
//                 </div>

//                 {/* Estado */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Estado
//                   </label>
//                   <select
//                     value={formData.estado || 'ACTIVO'}
//                     onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'ACTIVO' | 'INACTIVO' | 'OBSOLETO' }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="ACTIVO">Activo</option>
//                     <option value="INACTIVO">Inactivo</option>
//                     <option value="OBSOLETO">Obsoleto</option>
//                   </select>
//                 </div>

//                 {/* Fecha de Vencimiento */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Fecha de Vencimiento
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.fecha_vencimiento || ''}
//                     onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               {/* Descripción */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Descripción
//                 </label>
//                 <textarea
//                   rows={3}
//                   value={formData.descripcion || ''}
//                   onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Descripción detallada del artículo..."
//                 />
//               </div>

//               {/* Upload de Imagen */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Imagen del Artículo
//                 </label>
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
//                   <div className="space-y-1 text-center">
//                     {formData.imagen_url ? (
//                       <div className="space-y-3">
//                         <img
//                           src={formData.imagen_url}
//                           alt="Preview"
//                           className="mx-auto h-32 w-32 rounded-lg object-cover"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setFormData(prev => ({ ...prev, imagen_url: '' }))}
//                           className="text-red-600 hover:text-red-700 text-sm"
//                         >
//                           Remover imagen
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                         <div className="flex text-sm text-gray-600">
//                           <label
//                             htmlFor="file-upload"
//                             className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
//                           >
//                             <span>Subir imagen</span>
//                             <input
//                               ref={fileInputRef}
//                               id="file-upload"
//                               name="file-upload"
//                               type="file"
//                               accept="image/*"
//                               className="sr-only"
//                               onChange={handleImageUpload}
//                               disabled={uploadingImage}
//                             />
//                           </label>
//                           <p className="pl-1">o arrastra y suelta</p>
//                         </div>
//                         <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
//                       </>
//                     )}
//                     {uploadingImage && (
//                       <div className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                         <span className="ml-2 text-sm text-gray-600">Subiendo...</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Observaciones */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Observaciones
//                 </label>
//                 <textarea
//                   rows={2}
//                   value={formData.observaciones || ''}
//                   onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Observaciones adicionales..."
//                 />
//               </div>

//               {/* Botones */}
//               <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setFormData({});
//                     setEditingArticle(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={uploadingImage}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
//                 >
//                   <Save className="w-4 h-4" />
//                   <span>{editingArticle ? 'Actualizar' : 'Guardar'}</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/app/dashboard/admin/articulos/page.tsx

// src/app/dashboard/admin/articulos/page.tsx

// src/app/dashboard/admin/articulos/page.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { 
  Package, 
  Upload, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Image as ImageIcon,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

// Tipos para TypeScript
interface Article {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: string;
  proveedor_id?: string;
  ubicacion_id?: string;
  precio_unitario: number;
  stock_minimo: number;
  stock_actual: number;
  unidad_medida: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'OBSOLETO';
  fecha_vencimiento?: string;
  imagen_url?: string;
  observaciones?: string;
}

interface Category {
  id: string;
  nombre: string;
  codigo: string;
}

interface Provider {
  id: string;
  nombre: string;
  ruc: string;
}

interface Location {
  id: string;
  nombre: string;
  codigo: string;
}

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Article>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    stock_minimo: 0,
    stock_actual: 0,
    unidad_medida: 'UNIDAD',
    estado: 'ACTIVO',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesRes, categoriesRes, providersRes, locationsRes] = await Promise.all([
        supabase.from('articulos').select(`
          *,
          categorias(nombre),
          proveedores(nombre),
          ubicaciones(nombre)
        `).order('created_at', { ascending: false }),
        supabase.from('categorias').select('*'),
        supabase.from('proveedores').select('*'),
        supabase.from('ubicaciones').select('*')
      ]);

      if (articlesRes.data) {
        console.log('Artículos cargados:', articlesRes.data);
        // Verificar URLs de imágenes
        articlesRes.data.forEach((article, index) => {
          if (article.imagen_url) {
            console.log(`Artículo ${index} - ${article.nombre}: URL imagen = ${article.imagen_url}`);
          }
        });
        setArticles(articlesRes.data as Article[]);
      }
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      if (providersRes.data) setProviders(providersRes.data as Provider[]);
      if (locationsRes.data) setLocations(locationsRes.data as Location[]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload de imagen a Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      console.log('Iniciando upload a Supabase Storage...');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `articulos/${fileName}`;

      console.log('Subiendo archivo:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('inventario-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error en upload:', uploadError);
        throw uploadError;
      }

      console.log('Archivo subido correctamente, obteniendo URL pública...');

      // Obtener URL pública
      const { data } = supabase.storage
        .from('inventario-images')
        .getPublicUrl(filePath);

      console.log('URL pública generada:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error subiendo imagen:', errorMessage);
      alert(`Error detallado: ${errorMessage}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, imagen_url: imageUrl }));
    } else {
      alert('Error al subir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No autenticado');

      const dataToSave = {
        ...formData,
        created_by: user.data.user.id,
        updated_by: user.data.user.id
      };

      if (editingArticle) {
        // Actualizar
        const { error } = await supabase
          .from('articulos')
          .update(dataToSave)
          .eq('id', editingArticle.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('articulos')
          .insert(dataToSave);
        
        if (error) throw error;
      }

      setShowModal(false);
      setFormData({});
      setEditingArticle(null);
      loadData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error guardando artículo:', errorMessage);
      alert('Error al guardar el artículo');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData(article);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
    try {
      const { error } = await supabase
        .from('articulos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error eliminando artículo:', errorMessage);
      alert('Error al eliminar el artículo');
    }
  };

  // Filtrar artículos
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                Gestión de Artículos
              </h1>
              <p className="text-gray-600 mt-1">Administra el inventario de artículos</p>
            </div>
            <button
              onClick={() => {
                setEditingArticle(null);
                setFormData({});
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Artículo</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredArticles.length} artículos encontrados
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Artículos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código / Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.imagen_url ? (
                      <img
                        src={article.imagen_url}
                        alt={article.nombre || 'Imagen del artículo'}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{article.nombre}</div>
                      <div className="text-sm text-gray-500">{article.codigo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {article.stock_actual} / {article.stock_minimo}
                    </div>
                    <div className="text-xs text-gray-500">{article.unidad_medida}</div>
                    {article.stock_actual <= article.stock_minimo && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Stock Bajo
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {article.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                      article.estado === 'INACTIVO' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {article.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear/Editar Artículo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setEditingArticle(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: ART001"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del artículo"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <select
                    value={formData.proveedor_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, proveedor_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {providers.map(prov => (
                      <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    value={formData.ubicacion_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar ubicación</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Precio Unitario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Unitario (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_unitario || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stock Actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_actual || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stock Mínimo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_minimo || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Unidad de Medida */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unidad_medida || 'UNIDAD'}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidad_medida: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="KG">Kilogramos</option>
                    <option value="LITROS">Litros</option>
                    <option value="METROS">Metros</option>
                    <option value="CAJAS">Cajas</option>
                    <option value="PAQUETES">Paquetes</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado || 'ACTIVO'}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'ACTIVO' | 'INACTIVO' | 'OBSOLETO' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="OBSOLETO">Obsoleto</option>
                  </select>
                </div>

                {/* Fecha de Vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del artículo..."
                />
              </div>

              {/* Upload de Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Artículo
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    {formData.imagen_url ? (
                      <div className="space-y-3">
                        <img
                          src={formData.imagen_url}
                          alt="Preview del artículo"
                          className="mx-auto h-32 w-32 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imagen_url: '' }))}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remover imagen
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Subir imagen</span>
                            <input
                              ref={fileInputRef}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                      </>
                    )}
                    {uploadingImage && (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Subiendo...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingArticle ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}