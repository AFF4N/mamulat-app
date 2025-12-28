import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks';
import { useMaamulatStore, MaamulatCategory } from '@/stores';
import { spacing, borderRadius } from '@/constants/Colors';

interface MaamulatEditorProps {
    visible: boolean;
    onClose: () => void;
}

// Enable LayoutAnimation on Android
if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Common emojis for category icons
const EMOJI_OPTIONS = ['📿', '📖', '🌅', '🌙', '☀️', '🤲', '💚', '⭐', '🕋', '🌳', '💎', '🔥', '✨', '🌸', '🎯', '📌'];

/**
 * Modal for editing maamulat categories and items
 */
export function MaamulatEditor({ visible, onClose }: MaamulatEditorProps) {
    const { colors, isDark } = useTheme();
    const {
        categories,
        addItem,
        removeItem,
        updateItem,
        addCategory,
        removeCategory,
        updateCategory,
        reorderCategories,
    } = useMaamulatStore();

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{ categoryId: string; itemId: string } | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editValue, setEditValue] = useState('');

    // Add new item to category
    const handleAddItem = (categoryId: string) => {
        if (!newItemName.trim()) return;
        addItem(categoryId, {
            id: `custom-${Date.now()}`,
            name: newItemName.trim(),
            hasanat: 10,
        });
        setNewItemName('');
    };

    // Delete item with confirmation
    const handleDeleteItem = (categoryId: string, itemId: string, itemName: string) => {
        Alert.alert('Delete', `Delete "${itemName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeItem(categoryId, itemId) },
        ]);
    };

    // Start editing item
    const startEditItem = (categoryId: string, itemId: string, currentName: string) => {
        setEditingItem({ categoryId, itemId });
        setEditValue(currentName);
    };

    // Save item edit
    const saveItemEdit = () => {
        if (editingItem && editValue.trim()) {
            updateItem(editingItem.categoryId, editingItem.itemId, { name: editValue.trim() });
        }
        setEditingItem(null);
        setEditValue('');
    };

    // Start editing category
    const startEditCategory = (categoryId: string, currentName: string) => {
        setEditingCategory(categoryId);
        setEditValue(currentName);
    };

    // Save category edit
    const saveCategoryEdit = () => {
        if (editingCategory && editValue.trim()) {
            updateCategory(editingCategory, { name: editValue.trim() });
        }
        setEditingCategory(null);
        setEditValue('');
    };

    // Select emoji for category
    const handleSelectEmoji = (categoryId: string, emoji: string) => {
        updateCategory(categoryId, { emoji });
        setShowEmojiPicker(null);
    };

    // Move category up/down with animation
    const moveCategory = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < categories.length) {
            // Trigger layout animation
            LayoutAnimation.configureNext({
                duration: 300,
                update: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                },
            });
            reorderCategories(index, newIndex);
        }
    };

    // Add new category
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        addCategory({
            id: `custom-cat-${Date.now()}`,
            name: newCategoryName.trim(),
            nameEn: newCategoryName.trim(),
            color: '#6B7280',
            emoji: '📿',
        });
        setNewCategoryName('');
    };

    // Delete category
    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        Alert.alert('Delete Category', `Delete "${categoryName}" and all tasks?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeCategory(categoryId) },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 40}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text variant="h3" weight="bold">Edit Maamulat</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {categories.map((category, catIndex) => (
                        <View key={category.id} style={[styles.categoryCard, { borderColor: colors.border }]}>
                            {/* Category Row */}
                            <View style={styles.categoryRow}>
                                {/* Move Up/Down */}
                                <View style={styles.moveButtons}>
                                    <TouchableOpacity
                                        onPress={() => moveCategory(catIndex, 'up')}
                                        disabled={catIndex === 0}
                                        style={styles.moveButton}
                                    >
                                        <Ionicons name="chevron-up" size={18} color={catIndex === 0 ? colors.border : colors.textMuted} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => moveCategory(catIndex, 'down')}
                                        disabled={catIndex === categories.length - 1}
                                        style={styles.moveButton}
                                    >
                                        <Ionicons name="chevron-down" size={18} color={catIndex === categories.length - 1 ? colors.border : colors.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                {/* Emoji Picker */}
                                <TouchableOpacity onPress={() => setShowEmojiPicker(showEmojiPicker === category.id ? null : category.id)}>
                                    <Text style={styles.emoji}>{category.emoji || '📿'}</Text>
                                </TouchableOpacity>

                                {/* Category Name */}
                                {editingCategory === category.id ? (
                                    <TextInput
                                        value={editValue}
                                        onChangeText={setEditValue}
                                        style={[styles.editInput, { color: colors.textPrimary, borderColor: colors.primary, flex: 1 }]}
                                        autoFocus
                                        onBlur={saveCategoryEdit}
                                        onSubmitEditing={saveCategoryEdit}
                                    />
                                ) : (
                                    <TouchableOpacity onPress={() => startEditCategory(category.id, category.name)} style={{ flex: 1 }}>
                                        <Text variant="body" weight="medium" style={{ writingDirection: 'rtl' }}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {/* Delete */}
                                <TouchableOpacity onPress={() => handleDeleteCategory(category.id, category.name)}>
                                    <Ionicons name="trash-outline" size={18} color="#DC3545" />
                                </TouchableOpacity>

                                {/* Expand */}
                                <TouchableOpacity onPress={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}>
                                    <Ionicons name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            {/* Emoji Picker Dropdown */}
                            {showEmojiPicker === category.id && (
                                <View style={[styles.emojiPicker, { backgroundColor: isDark ? colors.surface : '#F9F9F9' }]}>
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <TouchableOpacity key={emoji} onPress={() => handleSelectEmoji(category.id, emoji)} style={styles.emojiOption}>
                                            <Text style={styles.emojiText}>{emoji}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Expanded Items */}
                            {expandedCategory === category.id && (
                                <View style={[styles.itemsList, { borderTopColor: colors.border }]}>
                                    {category.items.map((item) => (
                                        <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                                            {editingItem?.categoryId === category.id && editingItem?.itemId === item.id ? (
                                                <TextInput
                                                    value={editValue}
                                                    onChangeText={setEditValue}
                                                    style={[styles.editInput, { color: colors.textPrimary, borderColor: colors.primary, flex: 1 }]}
                                                    autoFocus
                                                    onBlur={saveItemEdit}
                                                    onSubmitEditing={saveItemEdit}
                                                />
                                            ) : (
                                                <TouchableOpacity onPress={() => startEditItem(category.id, item.id, item.name)} style={{ flex: 1 }}>
                                                    <Text variant="body" style={{ writingDirection: 'rtl' }}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                            {/* Only show delete for non-permanent items (not isTime) */}
                                            {!(item as any).isTime && (
                                                <TouchableOpacity onPress={() => handleDeleteItem(category.id, item.id, item.name)}>
                                                    <Ionicons name="close-circle" size={18} color="#DC3545" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}

                                    {/* Add Item */}
                                    <View style={styles.addItemRow}>
                                        <TextInput
                                            value={newItemName}
                                            onChangeText={setNewItemName}
                                            placeholder="+ Add task"
                                            placeholderTextColor={colors.textMuted}
                                            style={[styles.addInput, { color: colors.textPrimary, flex: 1 }]}
                                            onSubmitEditing={() => handleAddItem(category.id)}
                                        />
                                        {newItemName.trim() && (
                                            <TouchableOpacity onPress={() => handleAddItem(category.id)}>
                                                <Ionicons name="add-circle" size={22} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Add Category */}
                    <View style={[styles.addCategoryRow, { borderColor: colors.border }]}>
                        <Text style={styles.emoji}>➕</Text>
                        <TextInput
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="New category..."
                            placeholderTextColor={colors.textMuted}
                            style={[styles.addInput, { color: colors.textPrimary, flex: 1 }]}
                            onSubmitEditing={handleAddCategory}
                        />
                        {newCategoryName.trim() && (
                            <TouchableOpacity onPress={handleAddCategory}>
                                <Ionicons name="add-circle" size={22} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    categoryCard: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    moveButtons: {
        alignItems: 'center',
    },
    moveButton: {
        padding: 2,
    },
    emoji: {
        fontSize: 22,
    },
    emojiPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.sm,
        gap: spacing.xs,
    },
    emojiOption: {
        padding: spacing.xs,
    },
    emojiText: {
        fontSize: 24,
    },
    itemsList: {
        borderTopWidth: 1,
        paddingHorizontal: spacing.md,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 0.5,
        gap: spacing.sm,
    },
    editInput: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        fontSize: 16,
    },
    addItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    addInput: {
        fontSize: 16,
        paddingVertical: spacing.xs,
    },
    addCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
    },
});
