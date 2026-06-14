import { useState, useMemo } from "react";
import {
  useGrammarCategories,
  useGrammarPoints,
  useGrammarPointDetails,
  useTts,
  useLearnedGrammarPoints,
  useToggleGrammarPointLearned,
  useGrammar // Added
} from "../../hooks";
import { useUiStore } from "../../stores/ui";
import { GrammarPageHeader } from "./components/GrammarPageHeader";
import { GrammarTree } from "./components/GrammarTree";
import { GrammarDetails } from "./components/GrammarDetails";
import type { CategoryNode } from "./types";
import type { GrammarPoint, GrammarNote } from "../../types"; // Added GrammarNote

export function GrammarPage() {
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  // Personal notes states
  const [activeTab, setActiveTab] = useState<"hsk" | "personal">("hsk");
  const [selectedNote, setSelectedNote] = useState<GrammarNote | null>(null);

  const {
    grammarShowPinyin: showPinyin,
    grammarShowEnglish: showEnglish,
    setGrammarShowPinyin: setShowPinyin,
    setGrammarShowEnglish: setShowEnglish,
  } = useUiStore();

  const { speakText } = useTts();

  const { data: learnedIdsArray = [] } = useLearnedGrammarPoints();
  const { mutate: toggleLearned } = useToggleGrammarPointLearned();

  const learnedIds = useMemo(() => new Set(learnedIdsArray), [learnedIdsArray]);

  // Fetch categories and points for the active level
  const { data: categories = [], isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = useGrammarCategories(activeLevel);
  const { data: points = [], isLoading: isPointsLoading, isFetching: isPointsFetching } = useGrammarPoints(activeLevel);

  // Fetch personal notes
  const {
    notes = [],
    isLoading: isNotesLoading,
    createNote,
    updateNote,
    deleteNote,
  } = useGrammar();

  // Find active grammar point ID to fetch details
  const activePointId = useMemo(() => {
    if (activeTab === "hsk") {
      return selectedPoint ? selectedPoint.id : null;
    } else {
      return selectedNote ? selectedNote.grammar_point_id : null;
    }
  }, [activeTab, selectedPoint, selectedNote]);

  // Fetch details for the selected grammar point
  const { data: details = null, isLoading: isDetailsLoading } = useGrammarPointDetails(
    activePointId
  );


  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Build the hierarchical category tree
  const categoryTree = useMemo(() => {
    const nodeMap = new Map<number, CategoryNode>();

    // 1. Create nodes for all categories
    categories.forEach((cat) => {
      nodeMap.set(cat.id, {
        id: cat.id,
        category: cat,
        children: [],
        points: [],
      });
    });

    // 2. Put points into their categories
    points.forEach((pt) => {
      if (pt.category_id !== null) {
        const node = nodeMap.get(pt.category_id);
        if (node) {
          node.points.push(pt);
        }
      }
    });

    // 3. Link child categories to their parents, identify root nodes
    const roots: CategoryNode[] = [];
    categories.forEach((cat) => {
      const node = nodeMap.get(cat.id)!;
      if (cat.parent_id === null) {
        roots.push(node);
      } else {
        const parentNode = nodeMap.get(cat.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    });

    return roots;
  }, [categories, points]);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return categoryTree;

    const cleanQuery = searchQuery.trim().toLowerCase();

    const filterNode = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .map((node) => {
          // Recursively filter children
          const filteredChildren = filterNode(node.children);

          // Filter points directly inside this category
          const filteredPoints = node.points.filter(
            (pt) =>
              pt.title_zh.toLowerCase().includes(cleanQuery) ||
              pt.title_vi.toLowerCase().includes(cleanQuery) ||
              (pt.title_en && pt.title_en.toLowerCase().includes(cleanQuery))
          );

          // Check if category name matches
          const categoryMatches =
            node.category.title_vi.toLowerCase().includes(cleanQuery) ||
            node.category.title_en.toLowerCase().includes(cleanQuery);

          if (filteredChildren.length > 0 || filteredPoints.length > 0 || categoryMatches) {
            return {
              ...node,
              children: filteredChildren,
              points: categoryMatches ? node.points : filteredPoints,
            };
          }
          return null;
        })
        .filter((n): n is CategoryNode => n !== null);
    };

    return filterNode(categoryTree);
  }, [categoryTree, searchQuery]);

  // Find official grammar point related to selected note (if any)
  const activePoint = useMemo(() => {
    if (activeTab === "hsk") {
      return selectedPoint;
    } else {
      if (selectedNote && selectedNote.grammar_point_id) {
        if (details && details.point && details.point.id === selectedNote.grammar_point_id) {
          return details.point;
        }
        return points.find((p) => p.id === selectedNote.grammar_point_id) || null;
      }
      return null;
    }
  }, [activeTab, selectedPoint, selectedNote, details, points]);

  // Find linked note for the currently selected HSK point
  const linkedNote = useMemo(() => {
    if (!selectedPoint) return null;
    return notes.find((n) => n.grammar_point_id === selectedPoint.id) || null;
  }, [notes, selectedPoint]);

  const handleSaveNote = async (data: any) => {
    if (data.id) {
      const updated = await updateNote(data);
      if (selectedNote && selectedNote.id === data.id) {
        setSelectedNote(updated);
      }
    } else {
      const created = await createNote(data);
      if (activeTab === "personal") {
        setSelectedNote(created);
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const handleResetSelection = () => {
    setSelectedPoint(null);
    setSelectedNote(null);
    setExpandedCategories({});
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      {/* Header section with HSK tabs */}
      <GrammarPageHeader
        activeLevel={activeLevel}
        setActiveLevel={setActiveLevel}
        onResetSelection={handleResetSelection}
      />

      {/* Main 2-Column Content Layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Category Tree & Search */}
        <GrammarTree
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCategoriesLoading={isCategoriesLoading}
          isPointsLoading={isPointsLoading}
          filteredTree={filteredTree}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          isFetching={isCategoriesFetching || isPointsFetching}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
          learnedIds={learnedIds}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedPoint(null);
            setSelectedNote(null);
          }}
          notes={notes}
          isNotesLoading={isNotesLoading}
          selectedNote={selectedNote}
          onSelectNote={(note) => {
            setSelectedNote(note);
            setSelectedPoint(null);
          }}
          onCreateNoteClick={() => {
            setSelectedNote({
              id: 0,
              note_type: "grammar",
              title: "",
              level: activeLevel,
              formula: "",
              explanation: "",
              examples: "",
              grammar_point_id: null,
            });
            setSelectedPoint(null);
          }}
        />

        {/* Right Column: Grammar Details Panel */}
        <GrammarDetails
          isDetailsLoading={isDetailsLoading}
          selectedPoint={activePoint}
          details={details}
          showPinyin={showPinyin}
          setShowPinyin={setShowPinyin}
          showEnglish={showEnglish}
          setShowEnglish={setShowEnglish}
          learnedIds={learnedIds}
          onToggleLearned={toggleLearned}
          speakText={speakText}
          selectedNote={activeTab === "personal" ? selectedNote : linkedNote}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onCancelEdit={() => setSelectedNote(null)}
        />
      </div>
    </div>
  );
}
