import type { Language } from '@/lib/preferences'

const translations = {
  'Cargando tu espacio de aprendizaje...': {
    en: 'Loading your learning space...',
    pt: 'Carregando seu espaco de aprendizagem...',
    fr: 'Chargement de votre espace d apprentissage...',
  },
  'No pudimos abrir Aprendizaje': {
    en: 'We could not open Learning',
    pt: 'Nao foi possivel abrir Aprendizagem',
    fr: 'Impossible d ouvrir Apprentissage',
  },
  'Volver a Aprendizaje': {
    en: 'Back to Learning',
    pt: 'Voltar para Aprendizagem',
    fr: 'Retour a l apprentissage',
  },
  Aprendizaje: {
    en: 'Learning',
    pt: 'Aprendizagem',
    fr: 'Apprentissage',
  },
  'Esta cuenta no puede crear contenido desde aqui': {
    en: 'This account cannot create content from here',
    pt: 'Esta conta nao pode criar conteudo daqui',
    fr: 'Ce compte ne peut pas creer de contenu ici',
  },
  'Esta seccion de creacion solo esta disponible para ciertas cuentas, asi que te mostramos una vista simple y sin opciones que no puedas usar.': {
    en: 'This creation section is only available for certain accounts, so we show you a simple view without options you cannot use.',
    pt: 'Esta secao de criacao esta disponivel apenas para algumas contas, entao mostramos uma vista simples sem opcoes que voce nao pode usar.',
    fr: 'Cette section de creation est reservee a certains comptes, donc nous affichons une vue simple sans options inutilisables.',
  },
  'Modo lectura': {
    en: 'Read mode',
    pt: 'Modo leitura',
    fr: 'Mode lecture',
  },
  'Desde esta cuenta puedes navegar el espacio de aprendizaje, pero no crear nuevo contenido.': {
    en: 'From this account you can browse the learning space, but not create new content.',
    pt: 'Com esta conta voce pode navegar pelo espaco de aprendizagem, mas nao criar conteudo novo.',
    fr: 'Avec ce compte, vous pouvez parcourir l espace d apprentissage, mais pas creer de nouveau contenu.',
  },
  'Como funciona': {
    en: 'How it works',
    pt: 'Como funciona',
    fr: 'Fonctionnement',
  },
  'Si en algun momento tu cuenta recibe permisos de creador, aqui mismo podras armar cursos, unidades y lecciones paso a paso.': {
    en: 'If your account receives creator permissions later, you will be able to build courses, units and lessons here step by step.',
    pt: 'Se sua conta receber permissoes de criador depois, voce podera montar cursos, unidades e aulas aqui passo a passo.',
    fr: 'Si votre compte recoit des droits de creation plus tard, vous pourrez construire des cours, unites et lecons ici etape par etape.',
  },
  Jerarquia: {
    en: 'Hierarchy',
    pt: 'Hierarquia',
    fr: 'Hierarchie',
  },
  'Como funciona el flujo': {
    en: 'How the flow works',
    pt: 'Como o fluxo funciona',
    fr: 'Fonctionnement du flux',
  },
  'Cursos disponibles': {
    en: 'Available courses',
    pt: 'Cursos disponiveis',
    fr: 'Cours disponibles',
  },
  'Explora el catalogo completo. Al abrir un curso podras ver su contenido en una pagina individual.': {
    en: 'Explore the full catalog. When you open a course you can see its content on an individual page.',
    pt: 'Explore o catalogo completo. Ao abrir um curso, voce podera ver seu conteudo em uma pagina individual.',
    fr: 'Explorez le catalogue complet. En ouvrant un cours, vous pourrez voir son contenu sur une page individuelle.',
  },
  'Menu creador': {
    en: 'Creator menu',
    pt: 'Menu do criador',
    fr: 'Menu createur',
  },
  'Crea un curso nuevo o gestiona el contenido que ya existe': {
    en: 'Create a new course or manage existing content',
    pt: 'Crie um novo curso ou gerencie o conteudo existente',
    fr: 'Creez un nouveau cours ou gerez le contenu existant',
  },
  'Aqui tienes dos caminos claros: empezar un curso desde cero o entrar a un curso existente para sumarle mas unidades, mas lecciones o quitar contenido.': {
    en: 'You have two clear paths: start a course from scratch or enter an existing course to add more units, more lessons or remove content.',
    pt: 'Voce tem dois caminhos claros: comecar um curso do zero ou entrar em um curso existente para adicionar unidades, aulas ou remover conteudo.',
    fr: 'Vous avez deux chemins clairs: commencer un cours de zero ou ouvrir un cours existant pour ajouter des unites, des lecons ou retirer du contenu.',
  },
  Curso: {
    en: 'Course',
    pt: 'Curso',
    fr: 'Cours',
  },
  Unidad: {
    en: 'Unit',
    pt: 'Unidade',
    fr: 'Unite',
  },
  Leccion: {
    en: 'Lesson',
    pt: 'Aula',
    fr: 'Lecon',
  },
  'Crear nuevo': {
    en: 'Create new',
    pt: 'Criar novo',
    fr: 'Creer',
  },
  'Empieza un curso desde cero': {
    en: 'Start a course from scratch',
    pt: 'Comece um curso do zero',
    fr: 'Commencez un cours de zero',
  },
  'Define el curso base y luego continua con su estructura.': {
    en: 'Define the base course and then continue with its structure.',
    pt: 'Defina o curso base e depois continue com sua estrutura.',
    fr: 'Definissez le cours de base puis continuez avec sa structure.',
  },
  'Gestionar existente': {
    en: 'Manage existing',
    pt: 'Gerenciar existente',
    fr: 'Gerer l existant',
  },
  'Agrega o quita contenido en cursos existentes': {
    en: 'Add or remove content in existing courses',
    pt: 'Adicione ou remova conteudo em cursos existentes',
    fr: 'Ajoutez ou retirez du contenu dans les cours existants',
  },
  'Selecciona uno de tus cursos y trabaja sus unidades y lecciones aparte.': {
    en: 'Select one of your courses and work on its units and lessons separately.',
    pt: 'Selecione um dos seus cursos e trabalhe suas unidades e aulas separadamente.',
    fr: 'Selectionnez l un de vos cours et travaillez ses unites et lecons separement.',
  },
  'Crea un curso nuevo': {
    en: 'Create a new course',
    pt: 'Crie um novo curso',
    fr: 'Creez un nouveau cours',
  },
  'Base de toda la estructura': {
    en: 'Base of the whole structure',
    pt: 'Base de toda a estrutura',
    fr: 'Base de toute la structure',
  },
  'Nombre del curso': {
    en: 'Course name',
    pt: 'Nome do curso',
    fr: 'Nom du cours',
  },
  'Descripcion del curso': {
    en: 'Course description',
    pt: 'Descricao do curso',
    fr: 'Description du cours',
  },
  'Crear curso': {
    en: 'Create course',
    pt: 'Criar curso',
    fr: 'Creer le cours',
  },
  Guardando: {
    en: 'Saving',
    pt: 'Salvando',
    fr: 'Enregistrement',
  },
  'Guardando...': {
    en: 'Saving...',
    pt: 'Salvando...',
    fr: 'Enregistrement...',
  },
  'Agrega mas contenido o quita lo que ya no va': {
    en: 'Add more content or remove what no longer fits',
    pt: 'Adicione mais conteudo ou remova o que nao serve mais',
    fr: 'Ajoutez du contenu ou retirez ce qui ne convient plus',
  },
  'Curso activo': {
    en: 'Active course',
    pt: 'Curso ativo',
    fr: 'Cours actif',
  },
  'Selecciona un curso propio': {
    en: 'Select one of your courses',
    pt: 'Selecione um curso seu',
    fr: 'Selectionnez l un de vos cours',
  },
  'Curso que vas a gestionar': {
    en: 'Course you will manage',
    pt: 'Curso que voce vai gerenciar',
    fr: 'Cours a gerer',
  },
  'Que puedes hacer aqui': {
    en: 'What you can do here',
    pt: 'O que voce pode fazer aqui',
    fr: 'Ce que vous pouvez faire ici',
  },
  'Agrega una unidad': {
    en: 'Add a unit',
    pt: 'Adicione uma unidade',
    fr: 'Ajoutez une unite',
  },
  'Primero crea un curso': {
    en: 'Create a course first',
    pt: 'Crie um curso primeiro',
    fr: 'Creez d abord un cours',
  },
  'Curso donde ira esta unidad': {
    en: 'Course where this unit will go',
    pt: 'Curso onde esta unidade entrara',
    fr: 'Cours ou ira cette unite',
  },
  'Titulo de la unidad': {
    en: 'Unit title',
    pt: 'Titulo da unidade',
    fr: 'Titre de l unite',
  },
  'Descripcion de la unidad': {
    en: 'Unit description',
    pt: 'Descricao da unidade',
    fr: 'Description de l unite',
  },
  'Crear unidad': {
    en: 'Create unit',
    pt: 'Criar unidade',
    fr: 'Creer l unite',
  },
  'Crea una leccion': {
    en: 'Create a lesson',
    pt: 'Crie uma aula',
    fr: 'Creez une lecon',
  },
  'Unidad donde ira la leccion': {
    en: 'Unit where the lesson will go',
    pt: 'Unidade onde a aula entrara',
    fr: 'Unite ou ira la lecon',
  },
  'Titulo de la leccion': {
    en: 'Lesson title',
    pt: 'Titulo da aula',
    fr: 'Titre de la lecon',
  },
  'Descripcion o contenido': {
    en: 'Description or content',
    pt: 'Descricao ou conteudo',
    fr: 'Description ou contenu',
  },
  'Video principal': {
    en: 'Main video',
    pt: 'Video principal',
    fr: 'Video principale',
  },
  'Seleccionar video': {
    en: 'Select video',
    pt: 'Selecionar video',
    fr: 'Selectionner une video',
  },
  'PDF opcional': {
    en: 'Optional PDF',
    pt: 'PDF opcional',
    fr: 'PDF optionnel',
  },
  'Seleccionar PDF': {
    en: 'Select PDF',
    pt: 'Selecionar PDF',
    fr: 'Selectionner un PDF',
  },
  'Crear leccion': {
    en: 'Create lesson',
    pt: 'Criar aula',
    fr: 'Creer la lecon',
  },
  Procesando: {
    en: 'Processing',
    pt: 'Processando',
    fr: 'Traitement',
  },
  'Procesando...': {
    en: 'Processing...',
    pt: 'Processando...',
    fr: 'Traitement...',
  },
  'Quita unidades o lecciones del curso actual': {
    en: 'Remove units or lessons from the current course',
    pt: 'Remova unidades ou aulas do curso atual',
    fr: 'Retirez des unites ou lecons du cours actuel',
  },
  'Sin curso seleccionado': {
    en: 'No course selected',
    pt: 'Nenhum curso selecionado',
    fr: 'Aucun cours selectionne',
  },
  'Quitar unidad': {
    en: 'Remove unit',
    pt: 'Remover unidade',
    fr: 'Retirer l unite',
  },
  'Quitar leccion': {
    en: 'Remove lesson',
    pt: 'Remover aula',
    fr: 'Retirer la lecon',
  },
  'Resumen mentor': {
    en: 'Mentor summary',
    pt: 'Resumo do mentor',
    fr: 'Resume mentor',
  },
  'Tu estructura actual': {
    en: 'Your current structure',
    pt: 'Sua estrutura atual',
    fr: 'Votre structure actuelle',
  },
  'Cursos propios': {
    en: 'Own courses',
    pt: 'Cursos proprios',
    fr: 'Vos cours',
  },
  'Unidades propias': {
    en: 'Own units',
    pt: 'Unidades proprias',
    fr: 'Vos unites',
  },
  'Lecciones propias': {
    en: 'Own lessons',
    pt: 'Aulas proprias',
    fr: 'Vos lecons',
  },
  'Ruta seleccionada': {
    en: 'Selected path',
    pt: 'Rota selecionada',
    fr: 'Parcours selectionne',
  },
  'Dos formas de trabajar': {
    en: 'Two ways to work',
    pt: 'Duas formas de trabalhar',
    fr: 'Deux facons de travailler',
  },
  'Explora todos los cursos': {
    en: 'Explore all courses',
    pt: 'Explore todos os cursos',
    fr: 'Explorez tous les cours',
  },
  'Progreso de subida': {
    en: 'Upload progress',
    pt: 'Progresso de envio',
    fr: 'Progression du televersement',
  },
  'Estado de la leccion': {
    en: 'Lesson status',
    pt: 'Estado da aula',
    fr: 'Etat de la lecon',
  },
  Catalogo: {
    en: 'Catalog',
    pt: 'Catalogo',
    fr: 'Catalogue',
  },
  'Todavia no hay cursos disponibles para mostrar.': {
    en: 'There are no courses available to show yet.',
    pt: 'Ainda nao ha cursos disponiveis para mostrar.',
    fr: 'Aucun cours disponible pour le moment.',
  },
  'Curso sin nombre': {
    en: 'Unnamed course',
    pt: 'Curso sem nome',
    fr: 'Cours sans nom',
  },
  'Este curso aun no tiene descripcion.': {
    en: 'This course does not have a description yet.',
    pt: 'Este curso ainda nao tem descricao.',
    fr: 'Ce cours n a pas encore de description.',
  },
  unidades: {
    en: 'units',
    pt: 'unidades',
    fr: 'unites',
  },
  lecciones: {
    en: 'lessons',
    pt: 'aulas',
    fr: 'lecons',
  },
  'Pagina': {
    en: 'Page',
    pt: 'Pagina',
    fr: 'Page',
  },
  Anterior: {
    en: 'Previous',
    pt: 'Anterior',
    fr: 'Precedent',
  },
  Siguiente: {
    en: 'Next',
    pt: 'Proxima',
    fr: 'Suivant',
  },
} as const

type TranslationSource = keyof typeof translations
type NonSpanishLanguage = Exclude<Language, 'es'>

const phraseLookup = new Map<string, TranslationSource>()

Object.entries(translations).forEach(([source, targets]) => {
  phraseLookup.set(source, source as TranslationSource)
  Object.values(targets).forEach((value) => phraseLookup.set(value, source as TranslationSource))
})

const translateValue = (value: string, language: Language) => {
  if (language === 'es') {
    return phraseLookup.get(value) ?? null
  }

  const source = phraseLookup.get(value)
  return source ? translations[source][language as NonSpanishLanguage] : null
}

const translateTextNode = (node: Text, language: Language) => {
  const value = node.nodeValue ?? ''
  const trimmed = value.trim()
  if (!trimmed) return

  const translated = translateValue(trimmed, language)
  if (!translated || translated === trimmed) return

  node.nodeValue = value.replace(trimmed, translated)
}

const translateElementAttributes = (element: Element, language: Language) => {
  if (!(element instanceof HTMLElement)) return

  ;['placeholder', 'aria-label', 'title', 'alt'].forEach((attributeName) => {
    const value = element.getAttribute(attributeName)
    if (!value) return

    const translated = translateValue(value.trim(), language)
    if (translated && translated !== value) {
      element.setAttribute(attributeName, translated)
    }
  })
}

const applyTranslations = (language: Language) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

  let textNode = walker.nextNode()
  while (textNode) {
    translateTextNode(textNode as Text, language)
    textNode = walker.nextNode()
  }

  document.body.querySelectorAll('*').forEach((element) => translateElementAttributes(element, language))
}

export const startUiTranslationObserver = (language: Language) => {
  if (typeof window === 'undefined') return () => {}

  let animationFrame = 0
  const run = () => {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = window.requestAnimationFrame(() => applyTranslations(language))
  }

  run()

  const observer = new MutationObserver(run)
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  })

  return () => {
    window.cancelAnimationFrame(animationFrame)
    observer.disconnect()
  }
}
