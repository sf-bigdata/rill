package sudo

import (
	"github.com/rilldata/rill/cli/cmd/sudo/autoinvite"
	"github.com/rilldata/rill/cli/cmd/sudo/superuser"
	"github.com/rilldata/rill/cli/pkg/config"
	"github.com/spf13/cobra"
)

func SudoCmd(cfg *config.Config) *cobra.Command {
	sudoCmd := &cobra.Command{
		Use:    "sudo",
		Short:  "sudo commands for superusers",
		Hidden: true,
	}
	sudoCmd.AddCommand(autoinvite.AutoinviteCmd(cfg))
	sudoCmd.AddCommand(superuser.SuperuserCmd(cfg))

	return sudoCmd
}