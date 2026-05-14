import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image,
         ActivityIndicator, TouchableOpacity,
         StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getUser } from '../../services/api';
import type { User, Skill, ProjectUser } from '../../types/user';

function SkillBar({ skill }: { skill: Skill }) {
    const percentage = Math.min((skill.level / 21) * 100, 100);
    
    return (
        <View style={skillStyles.container}>
        <View style={skillStyles.labelRow}>
            <Text style={skillStyles.name}>{skill.name}</Text>
            <Text style={skillStyles.level}>Lvl {skill.level.toFixed(2)}</Text>
        </View>
        <View style={skillStyles.barBackground}>
            <View style={[skillStyles.barFill, { width: `${percentage}%` }]} />
        </View>
        </View>
    );
}

function ProjectItem({ project }: { project: ProjectUser }) {
    const isValidated = project['validated?'] === true;
    // const isFailed = project.final_mark !== null && !isValidated;
    
    return (
        <View style={projectStyles.container}>
        <Text style={[
            projectStyles.status,
            isValidated ? projectStyles.success : projectStyles.failure
        ]}>
            {isValidated ? '✅' : '❌'}
        </Text>
        <View style={projectStyles.info}>
            <Text style={projectStyles.name}>{project.project.name}</Text>
            {project.final_mark !== null && (
            <Text style={projectStyles.mark}>{project.final_mark}/100</Text>
            )}
        </View>
        </View>
    );
}

export default function ProfileScreen() {
    const { login } = useLocalSearchParams<{ login: string }>();
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady) return;
        if (authLoading) return;
        if (!token) {
            router.replace('/');
            return;
        }
        loadProfile();
    }, [isReady, authLoading, login, token]);

    function DetailRow({ label, value }: { label: string; value: string }) {
        return (
            <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
            </View>
        );
    }

    async function loadProfile() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUser(login, token!);
            setProfile(data);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === 'NOT_FOUND')
                setError(`Login "${login}" introuvable.`);
                else if (err.message === 'UNAUTHORIZED')
                setError('Session expirée.');
                else
                setError('Erreur réseau.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading || authLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>← Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const cursus42 = profile.cursus_users.find(c => c.cursus_id === 21);
    const level = cursus42?.level ?? 0;
    const skills = cursus42?.skills ?? [];

    const projects = profile.projects_users
    .filter(p => p.status === 'finished')
    .sort((a, b) => (b.final_mark ?? 0) - (a.final_mark ?? 0));

    return (
        <ScrollView contentContainerStyle={styles.container}>
        
        {/* Photo + infos principales */}
        <Image
            source={{ uri: profile.image.versions.medium ?? profile.image.link ?? '' }}
            style={styles.avatar}
        />
        <Text style={styles.displayname}>{profile.displayname}</Text>
        <Text style={styles.login}>@{profile.login}</Text>
        <Text style={styles.level}>Niveau {level.toFixed(2)}</Text>

        {/* Détails (sujet : au moins 4) */}
        <View style={styles.detailsCard}>
            <DetailRow label="Email" value={profile.email} />
            <DetailRow label="Wallet" value={`${profile.wallet} ₳`} />
            <DetailRow label="Localisation" value={profile.location ?? 'Hors ligne'} />
            <DetailRow label="Points de correction" value={String(profile.correction_point)} />
            <DetailRow label="Grade" value={cursus42?.grade ?? 'N/A'} />
        </View>

        {/* Skills */}
        {skills.length > 0 && (
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map(skill => (
                <SkillBar key={skill.id} skill={skill} />
            ))}
            </View>
        )}

        {/* Projets */}
        {projects.length > 0 && (
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projets</Text>
            {projects.map(p => (
                <ProjectItem key={p.id} project={p} />
            ))}
            </View>
        )}

        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    error: {
        fontSize: 16,
        marginBottom: 12,
        color: '#9c0000',
    },
    backLink: {
        fontSize: 16,
        color: '#00babc',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    displayname: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    login: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    level: {
        fontSize: 16,
        color: '#00581d',
        marginBottom: 16,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        width: '100%',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
});

const skillStyles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
    },
    level: {
        fontSize: 14,
        color: '#666',
    },
    barBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: 8,
        backgroundColor: '#00babc',
        borderRadius: 4,
    },
});

const projectStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    status: {
        fontSize: 18,
        marginRight: 12,
    },
    success: {},
    failure: {},
    info: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 14,
        flex: 1,
    },
    mark: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
});